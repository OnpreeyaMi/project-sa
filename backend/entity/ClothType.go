package entity

import "gorm.io/gorm"

type ClothType struct {
	gorm.Model
	TypeName      string `gorm:"uniqueIndex;not null"`
	SortedClothes []*SortedClothes `gorm:"foreignKey:ClothTypeID"`
}
