package entity


import (
	"gorm.io/gorm"
    "time"
)

type SortingHistory struct {
    gorm.Model
    HisQuantity int       
    RecordedAt  time.Time 
    Action      string    `gorm:"size:10"`

    SortedClothesID uint
    SortedClothes   *SortedClothes `gorm:"foreignKey:SortedClothesID"`

    
   
}