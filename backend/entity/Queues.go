package entity

import (
		"gorm.io/gorm" 
)	

type Queue struct {
	gorm.Model
	
	Queue_type string
	Status string

	
	TimeslotID  uint
	Timeslot *Timeslot `gorm:"foreignKey:TimeslotID"`

	OrderID uint
	Order *Order `gorm:"foreignKey:OrderID"`

	Queueassignment *Queueassignment `gorm:"foreignKey:QueueID"`

	Queuehistory []*Queuehistory `gorm:"foreignKey:QueueID"`
	
	
}