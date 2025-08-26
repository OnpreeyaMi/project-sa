package entity

import "grm.io/gorm"

type Queuehistory struct {
	gorm.Model

	QueueID uint
	Queues Queue `gorm:"foreignKey:QueueID"`
}