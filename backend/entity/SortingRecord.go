package entity

import "time"

type SortingRecord struct {
	Sorting_id uint `gorm:"primaryKey;autoIncrement"`
	Sorting_Date time.Time
	Sorting_note string
	Sorting_status string

	Order_id uint
	Orders Order `gorm:"foreignKey:Order_id"`
	Sorted_id uint
	SortedClothes []SortedCloth `gorm:"foreignKey:Sorted_id"`
}