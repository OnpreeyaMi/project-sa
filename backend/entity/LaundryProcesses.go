package entity

import (
	"time"

	"gorm.io/gorm"
)

type LaundryProcess struct {
	gorm.Model
	//ProcessID  uint `gorm:"primaryKey;autoIncrement"`
	Step       string
	Status     string
	End_time   time.Time
	Start_time time.Time

	OrderID        uint
	Order          *Order `gorm:"foreignKey:OrderID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	EmployeeID     uint
	Employee       *Employee `gorm:"foreignKey:EmployeeID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	ServiceTypeID  uint
	ServiceType    *Servicetype `gorm:"foreignKey:ServiceTypeID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	
	MachineID      uint
	WashingMachine *Machine `gorm:"foreignKey:MachineID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	HistoryID uint
	History   History `gorm:"foreignKey:HistoryID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

}
