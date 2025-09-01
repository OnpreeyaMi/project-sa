package entity

import (
	"gorm.io/gorm"
)	

type Detergent struct {
	gorm.Model
	Name 		string
	Type 		string
	InStock 	int
	Orders 		[]*Order `gorm:"many2many:OrderDetergents;"`
	PurchaseDetergents []*PurchaseDetergent `gorm:"foreignKey:DetergentID"`
	UserID 		uint
	User 		*User `gorm:"foreignKey:UserID;"`
	CategoryID 	uint
	DetergentCategory *DetergentCategory `gorm:"foreignKey:CategoryID;"`
}