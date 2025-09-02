package entity

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email    string
	Password string
	Status   string

	RoleID uint
	Role *Role `gorm:"foreignKey:RoleID"`

	CustomerID uint
	Customers []*Customer `gorm:"foreignKey:UserID;references:ID"`

	PurchaseDetergent uint
	PurchaseDetergents []*PurchaseDetergent `gorm:"foreignKey:UserID;references:ID"`
	
	
	Employee *Employee `gorm:"foreignKey:UserID"`

}