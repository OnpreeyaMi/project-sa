package entity

import (
	"gorm.io/gorm"
)

type Address struct {
	gorm.Model
	AddressDetails string
	Latitude  float64
	Longitude float64
	IsDefault bool
	
	CustomerID uint
	Customer *Customer `gorm:"foreignKey:CustomerID;references:ID"`
	Orders []*Order `gorm:"foreignKey:AddressID"`
}