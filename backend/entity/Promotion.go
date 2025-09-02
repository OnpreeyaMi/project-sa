package entity

import (
	"gorm.io/gorm"
	"time"
)

type Promotion struct {
	gorm.Model
	PromotionName string
	Description   string
	DiscountValue uint
	StartDate     time.Time
	EndDate       time.Time
	Status        string
	PromoImage    string

	DiscountTypeID uint
	DiscountTypes   *DiscountType 

	PromotionUsage     []*PromotionUsage     `gorm:"foreignKey:PromotionID"`
	PromotionCondition []*PromotionCondition `gorm:"foreignKey:PromotionID"`
}
