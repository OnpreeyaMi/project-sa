package entity

import (
	"gorm.io/gorm"
)

type ClothType struct {
	gorm.Model
	Type_name string

	
	SortedClothes *SortedClothes `gorm:"foreignKey:ClothTypeID"`
	
}