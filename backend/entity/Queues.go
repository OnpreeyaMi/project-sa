package entity

import (
		"gorm.io/gorm" 
)	

type Queue struct {
	gorm.Model

	Queue_type string
	Status string

	TimeSlotID  *uint // เปลี่ยนเป็น pointer เพื่อให้ nullable
	TimeSlot *TimeSlot `gorm:"foreignKey:TimeSlotID"`

	OrderID uint
	Order *Order `gorm:"foreignKey:OrderID"`

	Queueassignment *QueueAssignment `gorm:"foreignKey:QueueID"`

	Queuehistory []*QueueHistory `gorm:"foreignKey:QueueID"`
}