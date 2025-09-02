package entity

import "gorm.io/gorm"

<<<<<<< HEAD
type QueueHistory struct {
=======
type Queuehistory struct {
>>>>>>> ae0b4f670b0322212318d085cd9a6f1b63f7af06
	gorm.Model

	QueueID uint
	Queues *Queue `gorm:"foreignKey:QueueID"`
}