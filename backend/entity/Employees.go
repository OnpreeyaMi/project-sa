package entity

import (
	"time"
)

type Employee struct {
	Employee_id   uint      `gorm:"primaryKey;autoIncrement"`
	First_name    string   
	Last_name     string
	Phone_number  string
	Gender        string
	Start_date    time.Time 

	Queue_id uint
	Position_id uint
	User_id uint

	Queues Queue `gorm:"foreignKey:Queue_id"`
	Position EmpPosition `gorm:"foreignKey:Position_id"`
	Users User `gorm:"foreignKey:User_id"`
}