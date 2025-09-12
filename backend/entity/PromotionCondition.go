package entity

import (
	"gorm.io/gorm"
)

type PromotionCondition struct {
	gorm.Model
	ConditionType string
	Value         uint
	PromotionID   uint
	Promotion     *Promotion `gorm:"foreignKey:PromotionID"`
}
