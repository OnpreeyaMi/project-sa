package entity

import (
	"time"
	"gorm.io/gorm"
)

type TimeSlot struct {
	gorm.Model

	Start_time time.Time
	End_time   time.Time

	Queues  []*Queue `gorm:"foreignKey:TimeSlotID"`

}