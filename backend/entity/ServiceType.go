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
	Orders 		[]*Order `gorm:"many2many:OrderServiceType;"`

	SortedClothes []*SortedClothes `gorm:"foreignKey:ServiceTypeID"`
}
//must add mock data