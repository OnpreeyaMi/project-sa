package entity

import "time"

type SortingHistory struct {
    HisID       uint      `gorm:"primaryKey" json:"his_id"`
    HisQuantity int       
    RecordedAt  time.Time 

    SortingID uint  // FK → SortingRecord
}