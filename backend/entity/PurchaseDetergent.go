package entity

import (
	"gorm.io/gorm"
)
type PurchaseDetergent struct {
	gorm.Model
	//DetergentID uint
	Detergent   *Detergent `gorm:"foreignKey:DetergentID;"`
	Quantity int
	Price float64
	Supplier string
	//UserID uint
	User User `gorm:"foreignKey:UserID;"`
	
}