package entity

import (
	"gorm.io/gorm"
	"time"
)

type PromotionUsage struct {
	gorm.Model
	UsageDate time.Time
	Status string

	PromotionID uint
	Promotion Promotion `gorm:"foreignKey:PromotionID"`

	OrderID uint
	Order Order `gorm:"foreignKey:OrderID"`

	CustomerID uint
	Customer Customer `gorm:"foreignKey:CustomerID"`
	
}