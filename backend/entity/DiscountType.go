package entity

import (
	"gorm.io/gorm"
)

type DiscountType struct {
	gorm.Model
	TypeName string
	Description string
	Promotions []*Promotion `gorm:"foreignKey:DiscountTypeID"`

}