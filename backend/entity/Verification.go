package entity

import (
	"time"
)

type Verification struct {
	TokenID uint `gorm:"primaryKey;autoIncrement"`
	Token    string
	Expiration time.Time
	Is_used bool
	
	CustomerID uint
	Customers Customer `gorm:"foreignKey:CustomerID"`
}