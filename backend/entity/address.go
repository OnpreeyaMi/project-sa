package entity	

import "gorm.io/gorm"

type Address struct {
	gorm.Model
	AddressDetail string
	Latitude      float64
	Longitude     float64
	IsDefault     bool
	CustomerID    uint
}
