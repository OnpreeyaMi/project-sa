package entity

import ("time"
	"gorm.io/gorm")

<<<<<<< HEAD
type QueueAssignment struct {
=======
type Queueassignment struct {
>>>>>>> ae0b4f670b0322212318d085cd9a6f1b63f7af06
	gorm.Model
	Assigned_time time.Time

	QueueID uint
	Queues *Queue `gorm:"foreignKey:QueueID"`
	
	EmployeeID uint
	Employee *Employee `gorm:"foreignKey:EmployeeID"`
}