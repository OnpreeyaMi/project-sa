package entity

import (
	"time"
)

type Customer struct {
	CustomerID uint `gorm:"primaryKey;autoIncrement"`
	First_name string
	Last_name string
	Phone_number string
	Created_at time.Time 
	Is_verified bool
	Gender string

	UserID uint
	User User `gorm:"foreignKey:UserID"`

	AddressID uint
	Addresses []Address `gorm:"foreignKey:AddressID"`

	TokenID uint
	Verifications []Verification `gorm:"foreignKey:TokenID"`

	ComplaintID uint
	Complaints []Complaint `gorm:"foreignKey:CustomerID"`

}