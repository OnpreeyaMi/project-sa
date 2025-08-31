package entity

import (
	"gorm.io/gorm"
    "time"
)

type SortingRecord struct {
	gorm.Model
	Sorting_ID uint `gorm:"primaryKey;autoIncrement"`
	Sorting_Date time.Time
	Sorting_note string

	OrderID uint
	Sorted_ID uint
	His_ID uint
	SortedClothes []SortedClothes `gorm:"foreignKey:SortedID"`
	Order []Order `gorm:"foreignKey:OrderID"`
	SortingHistory []SortingHistory `gorm:"foreignKey:His_ID"`
}