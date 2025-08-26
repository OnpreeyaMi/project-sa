package entity
import (
	"gorm.io/gorm"
)

type SortedClothes struct {
	gorm.Model
	Sorted_ID uint `gorm:"primaryKey;autoIncrement"`
	Sorted_quantity int

	Sorting_ID uint
	ClothType_ID uint
	SortingRecord SortingRecord `gorm:"foreignKey:SortingID"`
	ClothType []ClothType `gorm:"foreignKey:ClothTypeID"`
}