package entity

import "time"

type Timeslot struct {
	TimeSlotID uint `gorm:"primaryKey;autoIncrement"`
	Start_time time.Time
	End_time time.Time

}