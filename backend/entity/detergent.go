package entity

import "gorm.io/gorm"

type Detergent struct {
	gorm.Model
	Type           string
	Stock          int
	Price          float64
	LastUpdateDate string
	Orders         []Order `gorm:"many2many:order_detergents;"`
}
