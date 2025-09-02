package entity

import (
	"gorm.io/gorm"
)

type ClothType struct {
	gorm.Model
	Type_name string

	
	SortedClothes *SortedClothes `gorm:"foreignKey:ClothTypeID"`
	
<<<<<<< HEAD
}
=======
}
>>>>>>> ae0b4f670b0322212318d085cd9a6f1b63f7af06
