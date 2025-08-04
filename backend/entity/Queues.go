package entity

import "time"

type Queue struct {
	QueueID uint `gorm:"primaryKey;autoIncrement"`
	Updated_at time.Time
	Created_at time.Time
	Queue_type string
	Status string

	Employee *Employee `gorm:"foreignKey:QueueID;references:QueueID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	OrderID uint
	Order *Order `gorm:"foreignKey:OrderID"`

	TimeslotID uint
	TimeSlots []Timeslot `gorm:"foreignKey:QueueID;references:QueueID"`

	Queuehistory []Queuehistory `gorm:"foreignKey:QueueID;references:QueueID"`

	QueueAssignments []QueueAssignment `gorm:"foreignKey:QueueID;references:QueueID"`
}