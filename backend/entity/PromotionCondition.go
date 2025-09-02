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
<<<<<<< HEAD
}
=======
}
>>>>>>> ae0b4f670b0322212318d085cd9a6f1b63f7af06
