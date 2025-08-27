package entity

import (
	"time"

	"gorm.io/gorm"
)

type PromotionUsage struct {
	gorm.Model
	UsageDate time.Time
	Status    string

	PromotionID uint
	Promotion   *Promotion `gorm:"foreignKey:PromotionID"`

	OrderID uint
	Order   *Order `gorm:"foreignKey:OrderID"`

	CustomerID uint
	Customer   *Customer `gorm:"foreignKey:CustomerID"`
}
