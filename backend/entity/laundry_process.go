package entity

import "gorm.io/gorm"

type LaundryProcess struct {
	gorm.Model
	Step      string
	StartTime float64
	EndTime   float64
	OrderID   uint
	ServiceID uint
	MachineID uint
}
