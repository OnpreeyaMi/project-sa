package entity

import "gorm.io/gorm"

type Servicetype struct {
	gorm.Model
	//ServiceTypeID uint `gorm:"primaryKey;autoIncrement"`
	Tempetature uint 
	Name string
	Description string
	Price uint 

	LaundryProcesses []LaundryProcess `gorm:"foreignKey:ServiceTypeID;references:ID"`
}