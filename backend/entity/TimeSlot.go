package entity

import (
	"time"
	"gorm.io/gorm"
)

type TimeSlot struct {
	gorm.Model

	Start_time time.Time
	End_time   time.Time
	SlotType string `gorm:"not null"`
	Capacity int    `gorm:"default:5"`
	Status   string `gorm:"default:'available'"`

	Queue  []*Queue `gorm:"foreignKey:TimeSlotID"`

}