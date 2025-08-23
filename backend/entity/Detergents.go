package entity

import (
	"gorm.io/gorm"
)

type Detergent struct {
	gorm.Model
	Name        string
	Type        string
	InStock     int
	
	Orders []Order `gorm:"many2many:OrderDetergents;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
}