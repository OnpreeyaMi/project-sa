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

	PositionID uint
	UserID uint
	EmpPosition EmpPosition `gorm:"foreignKey:PositionID"`	
}
