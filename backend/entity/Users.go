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
	Roles *Role `gorm:"foreignKey:RoleID"`

	Customers []*Customer `gorm:"foreignKey:UserID;references:ID"`
	PurchaseDetergents []*PurchaseDetergent `gorm:"foreignKey:UserID;references:ID"`
}