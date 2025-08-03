package entity

import (
	"time"
)

type Employee struct {
	EmployeeID   uint      `gorm:"primaryKey;autoIncrement"`
	First_name    string   
	Last_name     string
	Phone_number  string
	Gender        string
	Start_date    time.Time 

	QueueID uint
	PositionID uint
	UserID uint

	Queue Queue `gorm:"foreignKey:QueueID"`
	Position EmpPosition `gorm:"foreignKey:PositionID"`
	User User `gorm:"foreignKey:UserID"`
	ReplyComplaintID uint
	ReplyComplaints []ReplyComplaint `gorm:"foreignKey:EmployeeID;references:EmployeeID"`
}