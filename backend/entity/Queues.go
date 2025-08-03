package entity

import "time"

type Queue struct {
	Queue_id uint `gorm:"primaryKey;autoIncrement"`
	Updated_at time.Time
	Created_at time.Time
	Queue_type string
	Status string

	Orders Order `gorm:"foreignKey:Order_id"`
	TimeSlot Timeslot `gorm:"foreignKey:TimeSlot_id"`
	//Eemployee Employee `gorm:"foreignKey:emp_id""`
	

}