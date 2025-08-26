package entity


import (
	"gorm.io/gorm"
    "time"
)

type SortingHistory struct {
    gorm.Model
    HisID       uint      `gorm:"primaryKey" json:"his_id"`
    HisQuantity int       
    RecordedAt  time.Time 

    Sorting_ID uint  // FK → SortingRecord
    SortingRecord []SortingRecord `gorm:"foreignKey:SortingID"`
}