package entity

import (
	"time"
)

type Employee struct {
	EmployeeID   uint `gorm:"primaryKey;autoIncrement"`
	First_name   string
	Last_name    string
	Phone_number string
	Gender       string
	Start_date   time.Time

	QueueID uint
	Queue   *Queue `gorm:"foreignKey:QueueID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	EmpPositionID uint
	EmpPosition   *EmpPosition `gorm:"foreignKey:EmpPositionID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	UserID uint
	User   *User `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	ReplyComplaints  []ReplyComplaint `gorm:"foreignKey:EmployeeID;references:EmployeeID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	TaskAssignments []Assignment `gorm:"foreignKey:EmployeeID;references:EmployeeID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	LaundryProcesses []LaundryProcess `gorm:"foreignKey:EmployeeID;references:EmployeeID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
}
