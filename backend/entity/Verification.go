package entity

import (
	"time"
)

type Verification struct {
	Token_id uint `gorm:"primaryKey;autoIncrement"`
	Token    string
	Expiration time.Time
	Is_used bool
	
	Customer_id uint
	Customers Customer `gorm:"foreignKey:Customer_id"`
}