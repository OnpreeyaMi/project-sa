package entity

import (
	"time"
)

type Address struct {
	AddressID   uint   `gorm:"primaryKey;autoIncrement"`
	Address_details string
	Latitude  float64
	Longitude float64
	Is_default bool
	Created_at time.Time
	
	CustomerID uint
	Customer Customer `gorm:"foreignKey:CustomerID;references:CustomerID"`

	OrderID uint
	Order Order `gorm:"foreignKey:OrderID;references:OrderID"`
}