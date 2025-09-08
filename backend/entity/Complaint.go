package entity

import (
	"time"
	"gorm.io/gorm"
)

type Complaint struct {
	gorm.Model

	// เดิมที่คุณมี
	StatusComplaint string    `gorm:"column:status_complaint"` // สถานะ เช่น "รอดำเนินการ"
	Title           string    `gorm:"column:title"`            // หัวข้อ
	Description     string    `gorm:"column:description"`      // รายละเอียด
	CreateDate      time.Time `gorm:"column:createdate"`       // เวลาสร้าง

	// เพิ่มเติมให้ตรงกับฟอร์ม/การใช้งาน
	PublicID string `gorm:"column:public_id;size:50;uniqueIndex"` // คืนให้ UI ใช้อ้างอิง
	Email    string `gorm:"column:email"`                         // อีเมลจากฟอร์ม (อาจว่างได้)
	OrderID  *uint  `gorm:"column:order_id"`                      // เลขคำสั่งซื้อ (อาจว่าง)

	// FK -> Customer
	CustomerID uint      `gorm:"column:customer_id;not null"`
	Customer   *Customer `gorm:"foreignKey:CustomerID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`

	// ความสัมพันธ์ย่อย
	Replies     []*ReplyComplaint     `gorm:"foreignKey:ComplaintID;references:ID;constraint:OnDelete:CASCADE"`
	Histories   []*HistoryComplain    `gorm:"foreignKey:ComplaintID;references:ID;constraint:OnDelete:CASCADE"`
	Attachments []*ComplaintAttachment `gorm:"foreignKey:ComplaintID;references:ID;constraint:OnDelete:CASCADE"`
}
