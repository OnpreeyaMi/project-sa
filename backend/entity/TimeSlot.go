package entity

import "time"

type Timeslot struct {
	grom.Model

	Start_time time.Time
	End_time   time.Time

	Queue  []Queue `gorm:"foreignKey:QueueID"`

}