package entity

import "time"

type Queuehistory struct {
	History_id uint `gorm:"primaryKey;autoIncrement"`
	Status     string
	TimeStamp   time.Time

	Queues Queue `gorm:"foreignKey:Queue_id"`
	

}