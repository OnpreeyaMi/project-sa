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

<<<<<<< HEAD
	QueueAssignment *QueueAssignment `gorm:"foreignKey:QueueID"`

	QueueHistory []*QueueHistory `gorm:"foreignKey:QueueID"`
=======
	Queueassignment *Queueassignment `gorm:"foreignKey:QueueID"`

	Queuehistory []*Queuehistory `gorm:"foreignKey:QueueID"`
>>>>>>> ae0b4f670b0322212318d085cd9a6f1b63f7af06
	
	
}