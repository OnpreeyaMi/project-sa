package entity

import "time"

type ReplyComplaint struct {
	ReplyComplaintID uint      `gorm:"column:reply_complaint_id;primaryKey;autoIncrement"`
	CreateReplyDate  time.Time `gorm:"column:createdate_reply"`
	Reply            string    `gorm:"column:reply"`
	Title            string    `gorm:"column:title"`
	Description      string    `gorm:"column:description"`

	EmpID       uint     `gorm:"column:emp_id"`       // FK -> employees.emp_id
	Employee    Employee `gorm:"foreignKey:EmpID;references:EmpID"`
	ComplaintID uint     `gorm:"column:complaint_id"` // FK -> complaints.complaint_id
	Complaint   Complaint `gorm:"foreignKey:ComplaintID;references:ComplaintID"`
}

func (ReplyComplaint) TableName() string { return "reply_complaint" }
