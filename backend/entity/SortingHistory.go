package entity


import (
	"gorm.io/gorm"
    "time"
)

type SortingHistory struct {
    gorm.Model
    HisQuantity int       
    RecordedAt  time.Time 

    SortedClothesID uint
    SortedClothes   *SortedClothes `gorm:"foreignKey:SortedClothesID"`

    
   
}