package entity

import (
	"time"

	"gorm.io/gorm"
)

type SortingRecord struct {
	gorm.Model
	//SortingID uint `gorm:"primaryKey;autoIncrement"`
	Sorting_Date time.Time
	Sorting_note string
	Sorting_status string

	OrderID uint
	Order *Order `gorm:"foreignKey:OrderID;references:ID"`

	SortedID uint
	SortedClothes []SortedCloth `gorm:"many2many:sorting_record;"`
}