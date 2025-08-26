package entity

import "time"

type HistoryComplain struct {
	HistoryID  uint      `gorm:"column:history_id;primaryKey;autoIncrement"`
	StatusOld  string    `gorm:"column:status_old"`
	StatusNew  string    `gorm:"column:status_new"`
	Note       string    `gorm:"column:note"`
	ChangedDate time.Time `gorm:"column:changed_date"`

	ComplaintID uint      `gorm:"column:complaint_id"` // FK -> complaints
	Complaint   Complaint `gorm:"foreignKey:ComplaintID;references:ComplaintID"`

	ChangedBy uint     `gorm:"column:changed_by"` // FK -> employees.emp_id
	Employee  Employee `gorm:"foreignKey:ChangedBy;references:EmpID"`
}

func (HistoryComplain) TableName() string { return "history_complains" }
