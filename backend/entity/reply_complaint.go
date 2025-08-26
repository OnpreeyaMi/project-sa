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
    Title           string    `gorm:"column:title"`
    Description     string    `gorm:"column:description"`

    EmpID    uint     `gorm:"column:emp_id"`
    Employee Employee `gorm:"foreignKey:EmpID;references:ID"` // <-- เปลี่ยน references:ID

    ComplaintID uint
    Complaint   Complaint `gorm:"foreignKey:ComplaintID;references:ID"`
}


func (ReplyComplaint) TableName() string { return "reply_complaint" }
