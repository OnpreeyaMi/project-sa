package entity

import "time"
type ReplyComplaint struct {
	Reply_complaintID uint `gorm:"primaryKey;autoIncrement"`
	Created_at time.Time
	Reply string
	EmployeeID uint
	Employee Employee `gorm:"foreignKey:EmployeeID;references:EmployeeID"`
	ComplaintID uint
	Complaint Complaint `gorm:"foreignKey:ComplaintID;references:ComplaintID"`
}