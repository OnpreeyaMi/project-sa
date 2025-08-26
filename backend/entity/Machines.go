package entity

import (
	"gorm.io/gorm"
)

type Machine struct {
	gorm.Model

	Machine_type string
	Capacity_kg uint
	
	//Many to Many กับ LaundryProcess
	LaundryProcess []LaundryProcess `gorm:"foreignKey:MachineID"`

}