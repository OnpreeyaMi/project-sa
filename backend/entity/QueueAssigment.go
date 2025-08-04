package entity

import "time"

type QueueAssignment struct {
	AssidnID uint `gorm:"primaryKey;autoIncrement"`
	Assigned_time time.Time

	QueueID uint
	Queue Queue `gorm:"foreignKey:QueueID"`
	//Eemployee Employee `gorm:"foreignKey:emp_id""`
	

}