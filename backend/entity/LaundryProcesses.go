package entity

import "time"

type LaundryProcess struct {
	ProcessID uint `gorm:"primaryKey;autoIncrement"`
	Step       string
	Status     string
	End_time   time.Time
	Start_time time.Time

	OrderID uint
	Orders Order `gorm:"foreignKey:OrderID"`
	EmployeeID uint
	Employees Employee `gorm:"foreignKey:EmployeeID"`
	ServiceTypeID uint
	ServiceType Servicetype `gorm:"foreignKey:ServiceTypeID"`
	MachineID uint
	WashingMachine Machine `gorm:"foreignKey:MachineID;references:MacchineID"`


}