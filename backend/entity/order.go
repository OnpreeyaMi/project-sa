package entity

import "gorm.io/gorm"

type Order struct {
	gorm.Model
	OrderNo    string
	OrderDate  string
	Status     string
	CustomerID uint
	AddressID  uint
	ServiceID  uint
	Payments   []Payment        `gorm:"foreignKey:OrderID"`
	Processes  []LaundryProcess `gorm:"foreignKey:OrderID"`
	Detergents []Detergent      `gorm:"many2many:order_detergents;"`
}
