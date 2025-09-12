package entity

import (
	"time"
	"gorm.io/gorm"
)

// reply_complaint.go
type ReplyComplaint struct {
    gorm.Model
    CreateReplyDate time.Time `gorm:"column:createdate_reply"`
    Reply           string    `gorm:"column:reply"`
    
    // Status     string     `gorm:"column:status"`
    EmpID       uint     `gorm:"column:emp_id"`
    Employee *Employee `gorm:"foreignKey:EmpID;references:ID"` // <-- เปลี่ยน references:ID

    ComplaintID uint
    Complaint   *Complaint `gorm:"foreignKey:ComplaintID;references:ID"`
}


