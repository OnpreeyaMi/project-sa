package controller

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/http"
	"os"
	
	// "strconv"
	"strings"
	"time"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)	


// ========================= EasySlip verify (ของเดิม) =========================

const easySlipURL = "https://developer.easyslip.com/api/v1/verify"
var ErrDuplicateSlip = errors.New("duplicate_slip")

type verifySlipIn struct {
	Base64 string  `json:"base64" binding:"required"`
	OrderID uint   `json:"orderId" binding:"required"`
	Amount float64 `json:"amount" binding:"required"`
}

type esVerifyReq struct {
	Image          string `json:"image"`
	CheckDuplicate bool   `json:"checkDuplicate"`
}
type esBank struct{ ID string `json:"id"` }
type esAmount struct{ Amount float64 `json:"amount"` }
type esData struct {
	TransRef string   `json:"transRef"`
	// Country  string   `json:"country"`
	Date     string   `json:"date"` // RFC3339
	Amount   esAmount `json:"amount"`
	// Receiver struct {
	// 	Bank esBank `json:"bank"`
	// } `json:"receiver"`
}
type esVerifyResp struct {
	Status  int     `json:"status"`
	Message string  `json:"message"`
	Data    *esData `json:"data"`
}

// รายการบริการแบบบาง ไม่ต้องประกอบเป็นข้อความ
type ServiceItemSlim struct {
    ServiceTypeID uint    `json:"serviceTypeId"`
    Type          string  `json:"type"`   // map มาจากชื่อ service ในตาราง ServiceType (เช่น Name/ServiceName)
    Price         float64 `json:"price"`  // map มาจาก price ในตาราง ServiceType
}

func stripDataURLPrefix(s string) string {
	prefixes := []string{
		"data:image/jpeg;base64,",
		"data:image/png;base64,",
		"data:image/jpg;base64,",
		"data:image/webp;base64,",
	}
	for _, p := range prefixes {
		if strings.HasPrefix(s, p) {
			return strings.TrimPrefix(s, p)
		}
	}
	return s
}

func VerifySlipBase64(c *gin.Context) {
	var in verifySlipIn
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	token := strings.TrimSpace(os.Getenv("EASYSLIP_TOKEN"))
	if token == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "server_not_configured"})
		return
	}

	// 1) Normalize base64
	raw := stripDataURLPrefix(strings.TrimSpace(in.Base64))
	if len(raw) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "empty_image"})
		return
	}
	// 2) Size guard
	if len(raw) > 2*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "image_too_large"})
		return
	}

	// 3) Call EasySlip
	reqBody, _ := json.Marshal(esVerifyReq{Image: raw, CheckDuplicate: true})
	httpReq, _ := http.NewRequest("POST", easySlipURL, bytes.NewBuffer(reqBody))
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+token)

	resp, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "easyslip_unreachable"})
		return
	}
	defer resp.Body.Close()


	var out esVerifyResp
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "easyslip_bad_response"})
		return
	}
	if out.Status != 200 || out.Data == nil {
    if strings.EqualFold(out.Message, "application_expired") {
        c.JSON(http.StatusServiceUnavailable, gin.H{
            "error":   "easyslip_application_expired",
            "message": "EasySlip application expired",
        })
        return
    }
    if strings.Contains(strings.ToLower(out.Message), "duplicate") {
        c.JSON(http.StatusConflict, gin.H{"error": "duplicate_slip"})
        return
    }
    c.JSON(http.StatusBadRequest, gin.H{"error": "easyslip_verify_failed", "message": out.Message})
    return
}

	// 4) Amount must match (±0.01)
	ea := out.Data.Amount.Amount
	if math.Abs(ea-in.Amount) > 0.01 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "amount_mismatch"})
		return
	}
	vamount := int(math.Round(ea))
	totalInt := int(math.Round(in.Amount))

	// 5) Save to DB (upsert by order, unique by trans_ref)
	db := config.DB
	var savedPaymentID uint
	var paidAtISO string

	txErr := db.Transaction(func(tx *gorm.DB) error {
		var pay entity.Payment
		if err := tx.Where("order_id = ?", in.OrderID).First(&pay).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				pay = entity.Payment{
					OrderID:       in.OrderID,
					PaymentType:   "PromptPay",
					
					TotalAmount:   totalInt,
					PaymentStatus: "pending",
				}
				if err := tx.Create(&pay).Error; err != nil {
					return err
				}
			} else {
				return err
			}
		}

		// parse slip time
		var slipTime *time.Time
		if t, err := time.Parse(time.RFC3339, out.Data.Date); err == nil {
			slipTime = &t
		}
		now := time.Now()

		pay.TransRef = out.Data.TransRef
		// pay.ReceiverBankID = out.Data.Receiver.Bank.ID
		// pay.CountryCode = out.Data.Country
		pay.VerifiedAmount = vamount
		pay.SlipDate = slipTime
		pay.SlipVerifiedAt = &now
		pay.PaymentStatus = "paid"
		pay.CheckPaymentB64 = raw

		if err := tx.Save(&pay).Error; err != nil {
			// unique trans_ref
			if strings.Contains(strings.ToLower(err.Error()), "unique") {
				return ErrDuplicateSlip
			}
			return err
		}

		savedPaymentID = pay.ID
		if pay.SlipVerifiedAt != nil {
			paidAtISO = pay.SlipVerifiedAt.Format(time.RFC3339)
		}
		return nil
	})

	if txErr != nil {
		if errors.Is(txErr, ErrDuplicateSlip) {
			c.JSON(http.StatusConflict, gin.H{"error": "duplicate_slip"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "save_payment_failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":         "ok",
		"paymentId":      savedPaymentID,
		"orderId":        in.OrderID,
		"transRef":       out.Data.TransRef,
		"paidAt":         paidAtISO,
		"verifiedAmount": vamount,
	})
}

// ========================= Checkout / Promotions (ใหม่) =========================

// DTO ให้สอดคล้องกับคอมโพเนนต์หน้า UI
type CheckoutResp struct {
	Customer struct {
		FullName string `json:"fullName"`
		Phone    string `json:"phone"`
	} `json:"customer"`
	Address struct {
		Text string `json:"text"`
	} `json:"address"`
	Order struct {
		ID        uint   `json:"id"`
		Summary   string `json:"summary"`
		Subtotal  int    `json:"subtotal"`
		Paid      bool   `json:"paid"`
		PaymentID *uint  `json:"paymentId,omitempty"`
		Items     []ServiceItemSlim `json:"items"`
	} `json:"order"`
	Promotions []PromoView `json:"promotions"`
	BestID     *string     `json:"bestId,omitempty"`
}

type PromoView struct {
	ID            string  `json:"id"`
	Code          string  `json:"code"`
	Title         string  `json:"title"`
	Description   string  `json:"description,omitempty"`
	DiscountType  string  `json:"discountType"` // "percent" | "amount"
	DiscountValue float64 `json:"discountValue"`
	MinSpend      *int    `json:"minSpend,omitempty"`
	ExpiresAt     string  `json:"expiresAt,omitempty"` // ISO-8601
	Disabled      bool    `json:"disabled,omitempty"`
	Badge         string  `json:"badge,omitempty"`
}

type PayCashRequest struct {
	OrderID uint `json:"order_id" binding:"required"`
	Amount  *int   `json:"amount,omitempty"` // ถ้าส่งมา จะ override ยอด
}


// mapping ประเภทส่วนลด (ถ้าตาราง DiscountType เป็น 1=percent, 2=amount)
// *หากโปรเจ็กต์คุณใช้ mapping อื่น ปรับให้ตรงได้เลย*
func mapDiscountType(p *entity.Promotion) string {
	if p.DiscountTypeID == 1 {
		return "percent"
	}
	return "amount"
}



// GET /payment/checkout/:orderId
// ดึงข้อมูลสรุปหน้าเช็คเอาต์: ลูกค้า/ที่อยู่/ออร์เดอร์/โปรโมชัน
func GetCheckoutData(c *gin.Context) {
	id := c.Param("orderId")
	var order entity.Order
	if err := config.DB.
		Preload("Customer").
		Preload("Address").
		Preload("Payment").
		Preload("ServiceTypes", func(db *gorm.DB) *gorm.DB {
			// เลือกเฉพาะคอลัมน์ที่ต้องใช้ ลด payload
			return db.Select("service_types.id", "service_types.type", "service_types.price")
			// ถ้าชื่อคอลัมน์จริงเป็น ServiceName/Amount:
			// return db.Select("service_types.id", "service_types.service_name", "service_types.amount")
		}).
		First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "order_not_found"})
		return
	}

	// subtotal: ใช้จาก payment.TotalAmount ถ้ามี (ให้สอดคล้อง Payment entity) :contentReference[oaicite:5]{index=5}
	subtotal := 0
	var payID *uint
	paid := false
	if order.Payment != nil {
		subtotal = order.Payment.TotalAmount
		paid = strings.EqualFold(order.Payment.PaymentStatus, "paid")
		payID = &order.Payment.ID
	}


	resp := CheckoutResp{}
	// customer
	if order.Customer != nil {
		resp.Customer.FullName = strings.TrimSpace(order.Customer.FirstName + " " + order.Customer.LastName) // :contentReference[oaicite:6]{index=6}
		resp.Customer.Phone = order.Customer.PhoneNumber                                                     // :contentReference[oaicite:7]{index=7}
	}
	// address
	if order.Address != nil {
    	resp.Address.Text = strings.TrimSpace(order.Address.AddressDetails)
	} else {
		resp.Address.Text = ""
	}
	// order
	resp.Order.ID = order.ID
	resp.Order.Summary = "ออร์เดอร์ #" + fmt.Sprint(order.ID)
	resp.Order.Subtotal = subtotal
	resp.Order.Paid = paid
	resp.Order.PaymentID = payID

	items := make([]ServiceItemSlim, 0, len(order.ServiceTypes))
    for _, st := range order.ServiceTypes {
        // แก้ให้ตรง struct จริงของคุณ:
        name  := st.Type   // หรือ st.ServiceName
        price := st.Price  // หรือ float64(st.Amount)

        items = append(items, ServiceItemSlim{
            ServiceTypeID: st.ID,
            Type:          name,
            Price:         price,
        })
    }
    resp.Order.Items = items
	resp.Promotions = nil
    resp.BestID = nil
	c.JSON(http.StatusOK, resp)
}

// POST /payments/cash
func PayByCashSimple(c *gin.Context) {
	var req PayCashRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ✅ ถ้า frontend ส่ง amount มาด้วย → ใช้เลย (ถือว่าเป็นยอดสุทธิหลังหักโปร)
	total := 0
	if req.Amount != nil && *req.Amount > 0 {
		total = *req.Amount
	} else {
		// ❌ ไม่ส่ง amount → fallback: sum ของ ServiceTypes
		var order entity.Order
		if err := config.DB.Preload("ServiceTypes").First(&order, req.OrderID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "order_not_found"})
			return
		}
		sum := 0.0
		for _, st := range order.ServiceTypes {
			sum += st.Price
		}
		total = int(math.Round(sum))
	}

	// gen trans_ref กันชน UNIQUE
	transRef := fmt.Sprintf("CASH-%d-%d", req.OrderID, time.Now().UnixNano())

	payment := entity.Payment{
		OrderID:        req.OrderID,
		PaymentType:    "cash",
		PaymentStatus:  "paid",
		VerifiedAmount: total,
		TotalAmount:    total,
		TransRef:       transRef,
	}

	if err := config.DB.Create(&payment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot_create_payment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"ok":         true,
		"orderId":    req.OrderID,
		"total":      total,
		"payment_id": payment.ID,
		"trans_ref":  transRef,
		"payment":    payment,
	})
}



	