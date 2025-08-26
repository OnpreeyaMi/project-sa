package entity

import (
	"time"
	"gorm.io/gorm"
)

type Employee struct {
	gorm.Model
	Emp_ID    uint      `gorm:"primaryKey;autoIncrement"`
	First_name    string   
	Last_name     string
	Phone_number  string
	Gender        string
	Start_date    time.Time 

	Position_ID uint
	User_ID uint
	Status_ID uint
	User User `gorm:"foreignKey:UserID"`
	Emp_Position EmpPosition `gorm:"foreignKey:PositionID"`	
	EmployeeStatus []EmployeeStatus `gorm:"foreignKey:Status_ID"`
}
