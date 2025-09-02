package entity

import "gorm.io/gorm"

type QueueHistory struct {
	gorm.Model

	QueueID uint
	Queues *Queue `gorm:"foreignKey:QueueID"`
}