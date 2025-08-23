package entity

import (
	"time"

	"gorm.io/gorm"
)

type QueueAssignment struct {
	gorm.Model
	//AssidnID uint `gorm:"primaryKey;autoIncrement"`
	Assigned_time time.Time

	QueueID uint
	Queue Queue `gorm:"foreignKey:QueueID"`
	//Eemployee Employee `gorm:"foreignKey:emp_id""`
	

}