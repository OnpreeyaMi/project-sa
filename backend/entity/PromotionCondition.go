package entity

import (
	"gorm.io/gorm"
)

type PromotionCondition struct {
	gorm.Model
	ConditionType string
	Value         string
	
	PromotionID   uint
	Promotions    *Promotion `gorm:"foreignKey:PromotionID"`
}
