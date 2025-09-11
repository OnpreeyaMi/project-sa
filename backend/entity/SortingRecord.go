package entity

import (
	"gorm.io/gorm"
    "time"
)

type SortingRecord struct {
	gorm.Model

	SortingDate time.Time
	SortingNote string
	
	OrderID uint
	Order *Order `gorm:"foreignKey:OrderID"`

	SortedClothes []*SortedClothes `gorm:"foreignKey:SortingRecordID"`

	
}