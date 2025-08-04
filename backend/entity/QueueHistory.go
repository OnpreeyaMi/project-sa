package entity

import "time"

type Queuehistory struct {
	HistoryID uint `gorm:"primaryKey;autoIncrement"`
	Status     string
	TimeStamp   time.Time

	QueueID uint
	Queues Queue `gorm:"foreignKey:QueueID"`
}