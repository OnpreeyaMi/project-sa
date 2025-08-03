package entity

import (
	"time"
)
 type Complaint struct {
	Complaint_id uint `gorm:"primaryKey;autoIncrement"`
	Status_complaint string
	Title string
	Description string
	Created_at time.Time

	Customer_id uint
	Customers Customer `gorm:"foreignKey:Customer_id"`
	Order_id uint
	Orders Order `gorm:"foreignKey:Order_id"`

	Reply_complaint_id uint
	ReplyComplaints []ReplyComplaint `gorm:"foreignKey:Reply_complaint_id"`
 }