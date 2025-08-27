package entity

import (
	"gorm.io/gorm"
)
//ประเภทของเครื่องซัก-อบ ผูกราคา
type ServiceType struct {
	gorm.Model
	Type 		string
	Price 		float64
	Capacity 	int
	Orders 		[]*Order `gorm:"many2many:OrderServicetypes;"`
}
//must add mock data