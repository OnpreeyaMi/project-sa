package entity

import (
	"gorm.io/gorm"
)

type ClothType struct {
	gorm.Model
	TypeName string

	
	SortedClothes *SortedClothes `gorm:"foreignKey:ClothTypeID"`
	
}
