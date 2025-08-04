package entity

import "time"

type LaundryProcess struct {
	ProcessID  uint `gorm:"primaryKey;autoIncrement"`
	Step       string
	Status     string
	End_time   time.Time
	Start_time time.Time

	OrderID        uint
	Order          *Order `gorm:"foreignKey:OrderID;references:OrderID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	EmployeeID     uint
	Employee       Employee `gorm:"foreignKey:EmployeeID;references:EmployeeID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	ServiceTypeID  uint
	ServiceType    *Servicetype `gorm:"foreignKey:ServiceTypeID;references:ServiceTypeID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	
	MachineID      uint
	WashingMachine *Machine `gorm:"foreignKey:MachineID;references:MachineID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	HistoryID uint
	History   History `gorm:"foreignKey:HistoryID;references:HistoryID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

}
