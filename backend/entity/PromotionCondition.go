package entity

import (
	"gorm.io/gorm"
)

type PromotionCondition struct {
	gorm.Model
	ConditionType string
	Value         string
	PromotionID   uint
	Promotion     *Promotion `gorm:"foreignKey:PromotionID"`
}