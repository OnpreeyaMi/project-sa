package entity

import (
	"time"
	"gorm.io/gorm"
)

type TimeSlot struct {
	gorm.Model

	Start_time time.Time
	End_time   time.Time

<<<<<<< HEAD
	Queue  []*Queue `gorm:"foreignKey:TimeSlotID"`
=======
	Queues  []*Queue `gorm:"foreignKey:TimeSlotID"`
>>>>>>> ae0b4f670b0322212318d085cd9a6f1b63f7af06

}