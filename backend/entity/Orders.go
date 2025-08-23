package entity

import (
	"gorm.io/gorm"
)

type Order struct {
	gorm.Model
	// CustomerID uint
	// Customer   *Customer `gorm:"foreignKey:CustomerID;"`
	Servicetypes   []Servicetype `gorm:"many2many:OrderServicetypes;"`
	Detergents []Detergent `gorm:"many2many:OrderDetergents;"`
	OrderImage string
	OrderNote string
	// Process []Process `gorm:"many2many:OrderProcess;"`
	OrderHistory []OrderHistory `gorm:"foreignKey:OrderID;"`
	AddressID uint
	// Address *Address `gorm:"foreignKey:OrderID;"`
	// Usages []Usage `gorm:"foreignKey:OrderID;"`
}
//ประเภทของเครื่องซัก-อบ ผูกราคา
type Servicetype struct {
	gorm.Model
	Type string
	Price float64
	Capacity int
	Orders []Order `gorm:"many2many:OrderServicetypes;"`
}
//ประวัติการสร้างออเดอร์
type OrderHistory struct {
	gorm.Model
	OrderID uint
	Order   *Order `gorm:"foreignKey:OrderID;"`
	Status  string
	
}