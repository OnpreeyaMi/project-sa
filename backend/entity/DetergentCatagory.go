package entity

import (
	"gorm.io/gorm"
)
type DetergentCategory struct {
	gorm.Model
	Name        string
	Description string
	Detergents  []*Detergent `gorm:"foreignKey:CategoryID"`
}
//must add mock data
