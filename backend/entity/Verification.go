package entity

import (
	"time"

	"gorm.io/gorm"
)

type Verification struct {
	gorm.Model
	//TokenID uint `gorm:"primaryKey;autoIncrement"`
	Token    string
	Expiration time.Time
	Is_used bool
	
	CustomerID uint
	Customer Customer `gorm:"foreignKey:CustomerID;references:ID"`
}