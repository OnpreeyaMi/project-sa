package entity

import "time"
type ReplyComplaint struct {
	Reply_complaint_id uint `gorm:"primaryKey;autoIncrement"`
	Created_at time.Time
	Reply string
	Employee_id uint
	Employees Employee `gorm:"foreignKey:Employee_id"`
	Complaint_id uint
	Complaints Complaint `gorm:"foreignKey:Complaint_id"`
}