package entity

import "time"

type Queue struct {
	QueueID uint `gorm:"primaryKey;autoIncrement"`
	Updated_at time.Time
	Created_at time.Time
	Queue_type string
	Status string

	OrderID uint
	TimeslotID uint
	Orders Order `gorm:"foreignKey:OrderID"`
	TimeSlot Timeslot `gorm:"foreignKey:TimeSlotID"`
}