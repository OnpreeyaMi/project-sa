package entity

import "time"

type Complaint struct {
	ComplaintID     uint      `gorm:"column:complaint_id;primaryKey;autoIncrement"`
	StatusComplaint string    `gorm:"column:status_complaint"`
	Title           string    `gorm:"column:title"`
	Description     string    `gorm:"column:description"`
	CreateDate      time.Time `gorm:"column:createdate"`

	CustomerID uint     `gorm:"column:customer_id"` // FK -> customers.customer_id
	Customer   Customer `gorm:"foreignKey:CustomerID;references:CustomerID"`

	// Relations
	Replies  []ReplyComplaint  `gorm:"foreignKey:ComplaintID"`
	HistoryID []HistoryComplain `gorm:"foreignKey:ComplaintID"`
}


func (Complaint) TableName() string { return "complaints" }
