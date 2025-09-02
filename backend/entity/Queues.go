package entity

import (
		"gorm.io/gorm" 
)	

type Queue struct {
	gorm.Model
	
	Queue_type string
	Status string

	
	TimeSlotID  uint
	TimeSlot *TimeSlot `gorm:"foreignKey:TimeSlotID"`

	OrderID uint
	Order *Order `gorm:"foreignKey:OrderID"`

	QueueAssignment *QueueAssignment `gorm:"foreignKey:QueueID"`

	QueueHistory []*QueueHistory `gorm:"foreignKey:QueueID"`
	
	
}