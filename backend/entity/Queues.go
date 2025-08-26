package entity

import ("time" 

		"gorm.io/gorm" )	

type Queue struct {
	gorm.Model
	
	Queue_type string
	Status string

	
	TimeslotID  uint
	Timeslot Timeslot `gorm:"foreignKey:TimeslotID"`

	OrderID uint
	Order Order `gorm:"foreignKey:OrderID"`

	AssingID uint
	Queueassignment Queueassignment `gorm:"foreignKey:AssingID"`

	Queuehistory []Queuehistory `gorm:"foreignKey:QueueID"`
	
	
}