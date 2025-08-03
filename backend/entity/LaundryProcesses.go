package entity

import "time"

type LaundryProcess struct {
	Process_id uint `gorm:"primaryKey;autoIncrement"`
	Step       string
	Status     string
	End_time   time.Time
	Start_time time.Time

	Orders Order `gorm:"foreignKey:Order_id"`
	Employees Employee `gorm:"foreignKey:Employee_id"`
	ServiceType Servicetype `gorm:"foreignKey:ServiceType_id"`
	WashingMachines Machine  `gorm:"foreignKey:machine_id"`


}