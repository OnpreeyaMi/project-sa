package entity

import "gorm.io/gorm"

type ClothType struct {
	gorm.Model
	//ClothTypeID uint `gorm:"primaryKey;autoIncrement"`
	Type_name string

	SortedCloth *SortedCloth `gorm:"foreignKey:ClothTypeID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
}