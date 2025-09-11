package entity

import (
	"gorm.io/gorm"
	"time"
)

type SortingHistory struct {
	gorm.Model
	HisQuantity int       // จำนวนที่เปลี่ยน (+/-)
	RecordedAt  time.Time // เวลาบันทึก
	Action      string    `gorm:"size:10"` // ADD | EDIT | DELETE

	// อ้างถึงรายการผ้า
	SortedClothesID uint
	SortedClothes   *SortedClothes `gorm:"foreignKey:SortedClothesID"`

	// 🔥 Snapshot ณ ตอนเกิดเหตุการณ์ (เพื่อให้ประวัติสะท้อนค่าตอนนั้นจริง)
	ClothTypeID   *uint
	ServiceTypeID *uint
}
