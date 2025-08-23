package entity

import "gorm.io/gorm"

type Machine struct {
	gorm.Model
	//MachineID    uint `gorm:"primaryKey;autoIncrement"`
	Capacity_kg  uint
	Status       string
	Machine_type uint

	LaundryProcess *LaundryProcess `gorm:"foreignKey:MachineID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	// OrderID uint
	// Order *Order `gorm:"foreignKey:OrderID;references:OrderID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	Orders []Order `gorm:"many2many:OrderMachine;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	Price []Price `gorm:"foreignKey:MachineID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
}