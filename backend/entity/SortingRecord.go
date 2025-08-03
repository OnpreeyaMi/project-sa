package entity

import "time"

type SortingRecord struct {
	SortingID uint `gorm:"primaryKey;autoIncrement"`
	Sorting_Date time.Time
	Sorting_note string
	Sorting_status string

	OrderID uint
	Orders Order `gorm:"foreignKey:OrderID"`
	SortedID uint
	SortedClothes []SortedCloth `gorm:"foreignKey:SortedID"`
}