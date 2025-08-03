package entity

import (
	"time"
)

type Address struct {
	Address_id   uint   `gorm:"primaryKey;autoIncrement"`
	Address_details string
	Latitude  float64
	Longitude float64
	Is_default bool
	Created_at time.Time
	Customer_id uint
	Customers Customer `gorm:"foreignKey:Customer_id"`
}