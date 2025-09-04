// package entity

// import (
// 	"encoding/base64"
// 	"time"

// 	"gorm.io/gorm"
// )

// type Payment struct {
//     // PaymentID    uint      `gorm:"primaryKey;autoIncrement"`
//     gorm.Model
//     PaymentType  string
//     CreatedDate  time.Time
//     CheckPayment []byte
//     TotalAmount  int
//     PaymentStatus string
//     OrderID      uint
    

//     Histories    []*History     `gorm:"foreignKey:PaymentID"`
    

// }



package entity

import (
	"time"

	"gorm.io/gorm"
)

type Payment struct {
	gorm.Model

	// วิธีชำระ เช่น "PromptPay"
	PaymentType   string    `json:"payment_type"`
	CreatedDate   time.Time `json:"created_date"`

	// เก็บภาพสลิป (BLOB) — จะใส่หรือไม่ก็ได้
	CheckPayment  []byte    `json:"check_payment" gorm:"type:blob"`

	// ยอดที่คาดหวัง (ฝั่งระบบของคุณ)
	TotalAmount   int       `json:"total_amount"`

	// สถานะ: pending | paid | failed | duplicate
	PaymentStatus string    `json:"payment_status"`

	// อ้างไปยังออเดอร์
	OrderID       uint      `json:"order_id"`

	// ---------------- จาก EasySlip ----------------
	// อ้างอิงธุรกรรม (ใช้กันซ้ำ)
	TransRef       string     `json:"trans_ref" gorm:"uniqueIndex;size:64"`
	// รหัสธนาคารปลายทาง (BOT code เช่น SCB=014, KBANK=001)
	ReceiverBankID string     `json:"receiver_bank_id" gorm:"size:8"`
	// ประเทศ (TH)
	CountryCode    string     `json:"country_code" gorm:"size:8"`
	// ยอดเงินที่อ่านได้จากสลิป (ใช้ยืนยันกับ TotalAmount)
	VerifiedAmount int        `json:"verified_amount"`
	// เวลาที่สลิปทำรายการ (ตามที่ EasySlip คืนมา)
	SlipDate       *time.Time `json:"slip_date"`
	// เวลาที่เราตรวจและยืนยันสลิปผ่าน
	SlipVerifiedAt *time.Time `json:"slip_verified_at"`

	// ถ้าคุณมี History อยู่แล้วก็ใช้ต่อได้เลย
	Histories []*History `gorm:"foreignKey:PaymentID"`
}
