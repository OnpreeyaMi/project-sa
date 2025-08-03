package entity

import "time"

type Queueassignment struct {
	AssidnID uint `gorm:"primaryKey;autoIncrement"`
	Assigned_time time.Time

	QueueID uint
	Queues Queue `gorm:"foreignKey:QueueID"`
	//Eemployee Employee `gorm:"foreignKey:emp_id""`
	

}