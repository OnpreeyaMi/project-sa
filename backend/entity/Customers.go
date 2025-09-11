package entity

import (
	"gorm.io/gorm"
)

type Customer struct {
	gorm.Model
	FirstName string
	LastName string
	PhoneNumber string
	IsVerified bool
	
	GenderID uint
	Gender *Gender `gorm:"foreignKey:GenderID;references:ID"`

	UserID uint
	User *User `gorm:"foreignKey:UserID;references:ID"`

	Addresses []*Address `gorm:"foreignKey:CustomerID"`

	Orders []*Order `gorm:"foreignKey:CustomerID"`

}