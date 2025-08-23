package entity

import "gorm.io/gorm"

type SortedCloth struct {
	gorm.Model
	//SortedID uint `gorm:"primaryKey;autoIncrement"`
	Sorted_quantity int
	Sorted_basketCode uint

	ClothTypeID uint
	ClothType ClothType `gorm:"foreignKey:ClothTypeID"`

	SortingRecord  []SortingRecord `gorm:"many2many:sorted_clothes;"`
	
}