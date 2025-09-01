package entity

import (
	"time"
	"gorm.io/gorm"
)

type Complaint struct {
	gorm.Model

	StatusComplaint string    `gorm:"column:status_complaint"`
	Title           string    `gorm:"column:title"`
	Description     string    `gorm:"column:description"`
	CreateDate      time.Time `gorm:"column:createdate"`

	// FK ไป Customer.ID (เพราะ Customer ใช้ gorm.Model)
	CustomerID uint     `gorm:"column:customer_id;not null"`
	Customer   *Customer `gorm:"foreignKey:CustomerID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`

	// ความสัมพันธ์ย่อย
	Replies   []*ReplyComplaint  `gorm:"foreignKey:ComplaintID;references:ID;constraint:OnDelete:CASCADE"`
	Histories []*HistoryComplain `gorm:"foreignKey:ComplaintID;references:ID;constraint:OnDelete:CASCADE"`
}

func (Complaint) TableName() string { return "complaints" }
