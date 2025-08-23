package entity

import "gorm.io/gorm"

type Price struct {
	gorm.Model
	//PriceMachinrID uint `gorm:"primaryKey;autoIncrement"`
	Price uint
	
	MachineID uint
	WashingMachines Machine  `gorm:"foreignKey:MachineID"`

}