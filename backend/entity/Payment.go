
package entity

import (
	"time"

	"gorm.io/gorm"
)

type Payment struct {
	gorm.Model

	// วิธีชำระ เช่น "PromptPay"
	PaymentType   string    `json:"payment_type"`
	// CreatedDate   time.Time `json:"created_date"`     //ไม่จำเป็นให้gorm เเทน

	// เก็บภาพสลิปเพื่อเช็ค 
	CheckPaymentB64 string `gorm:"type:text" json:"check_payment_b64,omitempty"` // <- เก็บ Base64 (ไม่ใส่ใน JSON เวลาปกติได้ด้วย omitempty)     เเก้ไขจาก main 8/9/68

	// ยอดที่คาดหวัง (ฝั่งระบบของคุณ)
	TotalAmount   int       `json:"total_amount"`

	// สถานะ: pending | paid | failed | duplicate
	PaymentStatus string    `json:"payment_status"`

	// อ้างไปยังออเดอร์
	OrderID       uint      `json:"order_id"`
	

	// ---------------- จาก EasySlip ----------------
	// อ้างอิงธุรกรรม (ใช้กันซ้ำ)
	TransRef       string     `json:"trans_ref" gorm:"uniqueIndex;size:64"`
	// ReceiverBankID string     `json:"receiver_bank_id" gorm:"size:8"`
	// CountryCode    string     `json:"country_code" gorm:"size:8"`
	// ยอดเงินที่อ่านได้จากสลิป (ใช้ยืนยันกับ TotalAmount)
	VerifiedAmount int        `json:"verified_amount"`
	// เวลาที่สลิปทำรายการ (ตามที่ EasySlip คืนมา)
	SlipDate       *time.Time `json:"slip_date"`
	// เวลาที่เราตรวจและยืนยันสลิปผ่าน
	SlipVerifiedAt *time.Time `json:"slip_verified_at"`

	// ถ้าคุณมี History อยู่แล้วก็ใช้ต่อได้เลย
	Histories []*History `gorm:"foreignKey:PaymentID"`
}
