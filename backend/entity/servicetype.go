package entity

import "gorm.io/gorm"

type ServiceType struct {
	gorm.Model
	Type     string
	Price    float64
	Capacity int
	Orders   []Order `gorm:"foreignKey:ServiceID"`
}
