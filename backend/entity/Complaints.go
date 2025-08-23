package entity

import (
	"time"

	"gorm.io/gorm"
)

type Complaint struct {
	gorm.Model
	//ComplaintID      uint `gorm:"primaryKey;autoIncrement"`
	Status_complaint string
	Title            string
	Description      string
	Created_at       time.Time

	CustomerID       uint
	Customer         Customer `gorm:"foreignKey:CustomerID;references:ID"`

	OrderID          uint
	Order            Order `gorm:"foreignKey:OrderID;references:ID"`

	//ReplyComplaintID uint
	ReplyComplaints  []ReplyComplaint `gorm:"foreignKey:ComplaintID;references:ID"`
}
