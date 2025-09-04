package controller

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"errors"
	"math"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/OnpreeyaMi/project-sa/entity" // ← ใช้ path โมดูลจริงของโปรเจกต์คุณ
)

const easySlipURL = "https://developer.easyslip.com/api/v1/verify"

// ---------- DTO จาก Frontend ----------
type verifySlipIn struct {
	Base64 string  `binding:"required"`
	OrderID uint   `binding:"required"`
	Amount  float64 `binding:"required"` // ← รับเป็น float64
	BankID  string `binding:"required"`  // BOT code เช่น "014"
}

// ---------- EasySlip payload/response (เฉพาะฟิลด์ที่ใช้) ----------
type esVerifyReq struct {
	Image          string `json:"image"`
	CheckDuplicate bool   `json:"checkDuplicate"`
}

type esVerifyResp struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
	Data    *struct {
		TransRef string `json:"transRef"`
		Date     string `json:"date"`        // ISO8601
		Country  string `json:"countryCode"` // TH
		Amount   struct {
			Amount float64 `json:"amount"`
		} `json:"amount"`
		Sender struct {
			Bank struct {
				ID string `json:"id"`
			} `json:"bank"`
		} `json:"sender"`
		Receiver struct {
			Bank struct {
				ID string `json:"id"`
			} `json:"bank"`
		} `json:"receiver"`
	} `json:"data"`
}

// ---------- Handler ----------
func VerifySlipBase64(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var in verifySlipIn
		if err := c.ShouldBindJSON(&in); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// อ่านโทเค็นจาก ENV
		token := os.Getenv("EASYSLIP_TOKEN")
		if token == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "server_not_configured"})
			return
		}

		// ตัด prefix data URL ถ้ามี และ validate base64
		raw := stripDataURLPrefix(in.Base64)
		if _, err := base64.StdEncoding.DecodeString(raw); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_base64"})
			return
		}

		// เรียก EasySlip
		body, _ := json.Marshal(esVerifyReq{Image: raw, CheckDuplicate: true})
		req, _ := http.NewRequest(http.MethodPost, easySlipURL, bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": "easyslip_unreachable"})
			return
		}
		defer resp.Body.Close()

		var out esVerifyResp
		if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": "bad_easyslip_response"})
			return
		}
		if out.Status != 200 || out.Data == nil {
			// ตัวอย่าง message: duplicate_slip, invalid_image, slip_not_found ฯลฯ
			c.JSON(http.StatusBadRequest, gin.H{"error": out.Message})
			return
		}

		// ---------- กติกาตรวจเพิ่มฝั่งระบบ ----------
		// 1) ธนาคารปลายทางต้องตรงกับร้าน
		if strings.TrimSpace(out.Data.Receiver.Bank.ID) != strings.TrimSpace(in.BankID) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "receiver_bank_mismatch"})
			return
		}
		// 2) ยอดต้องตรง (เทียบ float ด้วย tolerance)
		ea := out.Data.Amount.Amount                 // float64 จาก EasySlip
		if math.Abs(ea-in.Amount) > 0.01 {           // เผื่อคลาดเคลื่อน 0.01
			c.JSON(http.StatusBadRequest, gin.H{"error": "amount_mismatch"})
			return
		}
		vamount := int(math.Round(ea))               // สำหรับเก็บลงตาราง (int บาทเต็ม)
		totalInt := int(math.Round(in.Amount))       // สำหรับ TotalAmount ตอนสร้างแถว

		// 3) ประเทศ (เผื่ออนาคต)
		if out.Data.Country != "TH" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "country_not_allowed"})
			return
		}

		// ---------- บันทึกลงตาราง payments ----------
		// กันซ้ำโดย Unique Index ที่ TransRef
		txErr := db.Transaction(func(tx *gorm.DB) error {
			var pay entity.Payment
			// หา payment ของออเดอร์นี้ (ออเดอร์ 1 รายการมี 1 payment)
			if err := tx.Where("order_id = ?", in.OrderID).First(&pay).Error; err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					pay = entity.Payment{
						OrderID:       in.OrderID,
						PaymentType:   "PromptPay",
						CreatedDate:   time.Now(),
						TotalAmount:   totalInt,        // ← เดิมคุณยัด float ลง int ทำให้คอมไพล์ไม่ผ่าน
						PaymentStatus: "pending",
					}
					if err := tx.Create(&pay).Error; err != nil {
						return err
					}
				} else {
					return err
				}
			}

			// เก็บรูป (ถ้าอยากเก็บ) — ไม่จำเป็นต้องเก็บก็ได้
			imgBytes, _ := base64.StdEncoding.DecodeString(raw)

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
			pay.CheckPayment = imgBytes

			if err := tx.Save(&pay).Error; err != nil {
				// ถ้า unique ทับ (trans_ref ซ้ำ) => duplicate
				if strings.Contains(err.Error(), "UNIQUE") || strings.Contains(strings.ToLower(err.Error()), "unique") {
					return errors.New("duplicate_slip")
				}
				return err
			}
			return nil
		})
		if txErr != nil {
			if txErr.Error() == "duplicate_slip" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "duplicate_slip"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "db_error"})
			return
		}

		// ตอบกลับให้ frontend
		c.JSON(http.StatusOK, gin.H{
			"ok":       true,
			"transRef": out.Data.TransRef,
			"date":     out.Data.Date,
			"amount":   ea, // ส่งกลับเป็นทศนิยมตามจริง
		})
	}
}

// ตัด data URL prefix ถ้ามี
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
