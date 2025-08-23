package entity

import (
	"time"

	"gorm.io/gorm"
)


type Queuehistory struct {
	gorm.Model
	//HistoryID uint `gorm:"primaryKey;autoIncrement"`
	Status     string
	TimeStamp   time.Time

	QueueID uint
	Queues Queue `gorm:"foreignKey:QueueID"`
}