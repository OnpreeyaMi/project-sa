package entity

import ("time"
	"gorm.io/gorm")

type Queueassignment struct {
	gorm.Model
	Assigned_time time.Time

	QueueID uint
	Queues Queue `gorm:"foreignKey:QueueID"`
	
	EmployeeID uint
	Employee Employee `gorm:"foreignKey:EmployeeID"`
}