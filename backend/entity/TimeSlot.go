package entity

import (
	"time"
	"gorm.io/gorm"
)

type Timeslot struct {
	gorm.Model


	Start_time time.Time
	End_time   time.Time

	Queue  []Queue `gorm:"foreignKey:QueueID"`

}