package entity

import "time"

type PositionCount struct {
PositionCountID    uint `gorm:"primaryKey" json:"position_count_id"`
TotalEmployee      int 
DateRecorded       time.Time 
PositionID         uint 
}