package entity

import (
	"gorm.io/gorm"
)	

type Detergent struct {
	gorm.Model
	Name string
	Type string
	InStock int
	Orders []Order `gorm:"many2many:OrderDetergents;"`
	PurchaseDetergents []PurchaseDetergent `gorm:"foreignKey:DetergentID"`
	// UserID uint
	// User User `gorm:"foreignKey:UserID;"`
}

type PurchaseDetergent struct {
	gorm.Model
	DetergentID uint
	Detergent   *Detergent `gorm:"foreignKey:DetergentID;"`
	Quantity int
	Price float64
	Supplier string
	// UserID uint
	// User User `gorm:"foreignKey:UserID;"`
	
}