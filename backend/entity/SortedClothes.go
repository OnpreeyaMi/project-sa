package entity

import "gorm.io/gorm"

type SortedClothes struct {
	gorm.Model

	SortedQuantity int
	SortedCount    int

	// ผูกกับ ClothType
	ClothTypeID uint
	ClothType   *ClothType `gorm:"foreignKey:ClothTypeID"`

	// >>> เพิ่มสองฟิลด์นี้ <<<
	ServiceTypeID uint
	ServiceType   *ServiceType `gorm:"foreignKey:ServiceTypeID"`

	// ผูกกับ SortingRecord
	SortingRecordID uint
	SortingRecord   *SortingRecord `gorm:"foreignKey:SortingRecordID"`

	// ถ้ามีประวัติหลายรายการ แนะนำให้เป็น slice
	// ถ้าคุณต้องการให้เป็นรายการเดียว เปลี่ยนกลับเป็น *SortingHistory ได้
	SortingHistory []*SortingHistory `gorm:"foreignKey:SortedClothesID"`
}
