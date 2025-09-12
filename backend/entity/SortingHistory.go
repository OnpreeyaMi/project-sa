package entity

import (
	"gorm.io/gorm"
	"time"
)

type SortingHistory struct {
	gorm.Model
	// เก็บ "จำนวนปัจจุบัน (absolute)" ของรายการ ณ ตอนเกิดเหตุการณ์ (ไม่ใช่ delta)
	HisQuantity int
	RecordedAt  time.Time
	Action      string `gorm:"size:10"` // ADD | EDIT | DELETE

	// อ้างถึงรายการผ้า
	SortedClothesID uint
	SortedClothes   *SortedClothes `gorm:"foreignKey:SortedClothesID"`

	// Snapshot เพื่อให้ประวัติสะท้อนชนิด/บริการตอนนั้น (แม้ภายหลังมีการแก้)
	ClothTypeID   *uint
	ServiceTypeID *uint
}
