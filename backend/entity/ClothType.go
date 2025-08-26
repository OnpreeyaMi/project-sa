package entity

import (
	"gorm.io/gorm"
)

type ClothType struct {
	gorm.Model
	ClothType_ID uint `gorm:"primaryKey;autoIncrement"`
	Type_name string

	Sorted_ID uint
	SortedClothes []SortedClothes `gorm:"foreignKey:Sorted_ID"`
}
