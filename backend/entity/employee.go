package entity

import (
	"time"
	"gorm.io/gorm"
)

type Employee struct {
	// EmpID     uint      `gorm:"column:emp_id;primaryKey;autoIncrement"`
	gorm.Model
	FirstName string    `gorm:"column:first_name"`
	LastName  string    `gorm:"column:last_name"`
	Phone     string    `gorm:"column:phone_number"`
	Gender    string    `gorm:"column:gender"`
	StartDate time.Time `gorm:"column:start_date"`

	StatusID *uint `gorm:"column:status_id"` // FK (ตาราง status ไม่แสดงใน ERD)
	RoleID   *uint `gorm:"column:role_id"`   // FK (ตาราง role ไม่แสดงใน ERD)

	// Relations
	Replies  []ReplyComplaint  `gorm:"foreignKey:EmpID"`
	Changes  []HistoryComplain `gorm:"foreignKey:ChangedBy"`
}

func (Employee) TableName() string { return "employees" }
