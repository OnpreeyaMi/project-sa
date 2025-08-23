package entity

import ("gorm.io/gorm" 
		"time"
)
type ReplyComplaint struct {
	gorm.Model
	//Reply_complaintID uint `gorm:"primaryKey;autoIncrement"`
	Created_at time.Time
	Reply string
	
	EmployeeID uint
	Employee *Employee `gorm:"foreignKey:EmployeeID;references:ID"`

	ComplaintID uint
	Complaint *Complaint `gorm:"foreignKey:ComplaintID;references:ID"`
}