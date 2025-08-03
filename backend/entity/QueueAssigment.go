package entity

import "time"

type Queueassignment struct {
	Assidn_id uint `gorm:"primaryKey;autoIncrement"`
	Assigned_time time.Time


	Queues Queue `gorm:"foreignKey:Queue_id"`
	//Eemployee Employee `gorm:"foreignKey:emp_id""`
	

}