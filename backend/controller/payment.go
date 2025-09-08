package controller

import (
	
	"bytes"
	"encoding/json"
	"errors"
	"math"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity" // ← ใช้ path โมดูลจริงของโปรเจกต์คุณ
)

const easySlipURL = "https://developer.easyslip.com/api/v1/verify"


var ErrDuplicateSlip = errors.New("duplicate_slip")


type verifySlipIn struct {
	Base64 string `json:"base64" binding:"required"`
	OrderID uint `json:"orderId" binding:"required"`
	Amount float64 `json:"amount" binding:"required"`
}


// Only fields we actually need from EasySlip
type esVerifyReq struct {
	Image string `json:"image"`
	CheckDuplicate bool `json:"checkDuplicate"`
}


type esBank struct { ID string `json:"id"` }


type esAmount struct { Amount float64 `json:"amount"` }


type esData struct {
	TransRef string `json:"transRef"`
	Country string `json:"country"`
	Date string `json:"date"` // RFC3339
	Amount esAmount `json:"amount"`
	Receiver struct {
	Bank esBank `json:"bank"`
	} `json:"receiver"`
}


type esVerifyResp struct {
	Status int `json:"status"`
	Message string `json:"message"`
	Data *esData `json:"data"`
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

// ---------- Handler ----------
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

    // 1) normalize base64 (รองรับกรณีส่งเป็น Data URL)
    raw := stripDataURLPrefix(strings.TrimSpace(in.Base64))
	if len(raw) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "empty_image"})
		return
	}

    // 2) (แนะนำ) จำกัดขนาดเพื่อกัน payload ใหญ่ผิดปกติ (~2MB base64 ≈ 1.5MB ไฟล์)
    if len(raw) > 2*1024*1024 { // ~2MB Base64 ≈ 1.5MB image
		c.JSON(http.StatusBadRequest, gin.H{"error": "image_too_large"})
		return
	}

	// 3)เรียก EasySlip
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
		// Pass through message if available
		if strings.Contains(strings.ToLower(out.Message), "duplicate") {
			c.JSON(http.StatusConflict, gin.H{"error": "duplicate_slip"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "easyslip_verify_failed", "message": out.Message})
		return
	}
			

	// 3) Bank must match SHOP_BANK_ID
	// wantBank := strings.TrimSpace(os.Getenv("SHOP_BANK_ID"))
	// if wantBank == "" { wantBank = "014" } // default SCB


	// gotBank := strings.TrimSpace(out.Data.Receiver.Bank.ID)
	// if gotBank == "" || gotBank != wantBank {
	// 	c.JSON(http.StatusBadRequest, gin.H{"error": "receiver_bank_mismatch", "want": wantBank, "got": gotBank})
	// 	return
	// }

	// 4) Amount must match (with small tolerance)
	ea := out.Data.Amount.Amount // float64 from EasySlip
	if math.Abs(ea-in.Amount) > 0.01 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "amount_mismatch"})
		return
	}
	vamount := int(math.Round(ea))               // สำหรับเก็บลงตาราง (int บาทเต็ม)
	totalInt := int(math.Round(in.Amount))       // สำหรับ TotalAmount ตอนสร้างแถว

		
	// ---------- บันทึกลงตาราง payments ----------
	// กันซ้ำโดย Unique Index ที่ TransRef
	db := config.DB
	var savedPaymentID uint
	var paidAtISO string
	
	txErr := db.Transaction(func(tx *gorm.DB) error {
		var pay entity.Payment
		// หา payment ของออเดอร์นี้ (ออเดอร์ 1 รายการมี 1 payment)
		if err := tx.Where("order_id = ?", in.OrderID).First(&pay).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				pay = entity.Payment{
					OrderID:       in.OrderID,
					PaymentType:   "PromptPay",
					TotalAmount:   totalInt,        // ← เดิมคุณยัด float ลง int ทำให้คอมไพล์ไม่ผ่าน
					PaymentStatus: "pending",
				}
				if err := tx.Create(&pay).Error; err != nil {
					return err
				}
			} else {return err}
		}


		// parse time จาก EasySlip
		var slipTime *time.Time
		if t, err := time.Parse(time.RFC3339, out.Data.Date); err == nil {
			slipTime = &t
		}

		pay.TransRef = out.Data.TransRef
		pay.ReceiverBankID = out.Data.Receiver.Bank.ID
		pay.CountryCode = out.Data.Country
		pay.VerifiedAmount = vamount
		pay.SlipDate = slipTime
		now := time.Now()
		pay.SlipVerifiedAt = &now
		pay.PaymentStatus = "paid"
		pay.CheckPaymentB64 = raw

		if err := tx.Save(&pay).Error; err != nil {
			// ถ้า unique ทับ (trans_ref ซ้ำ) => duplicate
			if strings.Contains(err.Error(), "UNIQUE") || strings.Contains(strings.ToLower(err.Error()), "unique") {
				return errors.New("duplicate_slip")
			}
			return err
		}
		// ✅ เซ็ตค่าที่จะใช้ตอบกลับ
		savedPaymentID = pay.ID
		if pay.SlipVerifiedAt != nil {
			paidAtISO = pay.SlipVerifiedAt.Format(time.RFC3339)
		}
		return nil
	})
	if txErr != nil {                                                               //เพื่อกัน response หลุดเป็น 200 และกันข้อมูลภายในรั่วออกไป
		if txErr.Error() == "duplicate_slip" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "duplicate_slip"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db_error"})
		return
	}
	// 6) Respond to frontend — keep it lean (no Base64 in response)
	c.JSON(http.StatusOK, gin.H{
		"ok": true,
		"message": "ตรวจสอบสลิปสำเร็จ",
		"transRef": out.Data.TransRef,
		"date": out.Data.Date,
		"amount": ea,
		"paymentId": savedPaymentID,
		"orderId": in.OrderID,
		"paidAt": paidAtISO,
	})
	
}



