package entity

import (
	//"time"

	"gorm.io/gorm"
)

type Address struct {
	gorm.Model
	//AddressID   uint   `gorm:"primaryKey;autoIncrement"`
	Address_details string
	Latitude  float64
	Longitude float64
	Is_default bool
	//Created_at time.Time
	
	CustomerID uint
	Customer Customer `gorm:"foreignKey:CustomerID;references:ID"`

	OrderID uint
	Order Order `gorm:"foreignKey:OrderID;references:ID"`
}