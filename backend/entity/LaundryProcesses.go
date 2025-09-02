package entity

import (
	"time"
	 
	"gorm.io/gorm")

type LaundryProcess struct {
	gorm.Model

	Status     string
	End_time   time.Time
	Start_time time.Time
	Description string

	//many to many เชื่อกับ Order
	Order []*Order `gorm:"many2many:process_orders"`
	//many to one กับ Employee
	EmployeeID uint
	Employee   *Employee `gorm:"foreignKey:EmployeeID"`
	//many to one กับ Sorting
	SortingID  uint
	SortingRecord    *SortingRecord `gorm:"foreignKey:SortingID"`
	//many to many กับ Machine
	Machine []*Machine `gorm:"many2many:MachineProcess"`
}