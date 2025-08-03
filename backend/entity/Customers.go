package entity

import (
	"time"
)

type Customer struct {
	Customer_id uint `gorm:"primaryKey;autoIncrement"`
	First_name string
	Last_name string
	Phone_number string
	Created_at time.Time 
	Is_verified bool
	Gender string
	User_id uint
	Users User `gorm:"foreignKey:User_id"`
	Address_id uint
	Addresses []Address `gorm:"foreignKey:Address_id"` 
	Token_id uint
	Verifications []Verification `gorm:"foreignKey:Token_id"`
}