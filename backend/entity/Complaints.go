package entity

import (
	"time"
)

type Complaint struct {
	ComplaintID      uint `gorm:"primaryKey;autoIncrement"`
	Status_complaint string
	Title            string
	Description      string
	Created_at       time.Time

	CustomerID       uint
	Customer         Customer `gorm:"foreignKey:CustomerID;references:CustomerID"`

	OrderID          uint
	Order            Order `gorm:"foreignKey:OrderID;references:OrderID"`

	//ReplyComplaintID uint
	ReplyComplaints  []ReplyComplaint `gorm:"foreignKey:ComplaintID;references:ComplaintID"`
}
