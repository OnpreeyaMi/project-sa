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
	CustomerImage string
	
	GenderID uint
	Gender *Gender `gorm:"foreignKey:GenderID"`

	UserID uint
	User *User `gorm:"foreignKey:UserID"`

	Addresses []*Address `gorm:"foreignKey:CustomerID"`

	OrderID uint
	Orders []*Order `gorm:"foreignKey:CustomerID;references:ID"`

}