package entity

import (
	"time"

	"gorm.io/gorm"
)

type Customer struct {
	gorm.Model 
	//CustomerID uint `gorm:"primaryKey;autoIncrement"`
	First_name string
	Last_name string
	Phone_number string
	Created_at time.Time 
	Is_verified bool
	Gender string

	User User `gorm:"foreignKey:CustomerID"`

	Addresses []Address `gorm:"foreignKey:CustomerID"`

	Verifications []Verification `gorm:"foreignKey:CustomerID"`

	Complaints []Complaint `gorm:"foreignKey:CustomerID"`

	Order []Order `gorm:"foreignKey:CustomerID"`

}