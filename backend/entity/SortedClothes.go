package entity
import (
	"gorm.io/gorm"
)

type SortedClothes struct {
	gorm.Model
	SortedQuantity 		int
	SortedCount 		int

	SortingHistory *SortingHistory `gorm:"foreignKey:SortedClothesID"`

	ClothTypeID uint
	ClothType   *ClothType `gorm:"foreignKey:ClothTypeID"`	

	SortingRecordID uint
	SortingRecord   *SortingRecord `gorm:"foreignKey:SortingRecordID"`

	ServiceTypeID uint
	ServiceType   *ServiceType `gorm:"foreignKey:ServiceTypeID"`
}