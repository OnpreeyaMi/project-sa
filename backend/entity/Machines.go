package entity

import (
	"gorm.io/gorm"
)

type Machine struct {
	gorm.Model

	Machine_type string
	Capacity_kg uint // ความจุของเครื่องซักผ้า/อบผ้า	
	Machine_number uint // เพิ่มหมายเลขเครื่อง
	Status string 
	
	//Many to Many กับ LaundryProcess
	LaundryProcess []*LaundryProcess `gorm:"many2many:MachineProcess"`

}