package entity

import "gorm.io/gorm"

type Customer struct {
	gorm.Model
	FirstName   string
	LastName    string
	Email       string
	PhoneNumber string
	Gender      string
	IsVerified  bool
	Addresses   []Address `gorm:"foreignKey:CustomerID"`
	Orders      []Order   `gorm:"foreignKey:CustomerID"`
}
