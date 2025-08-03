package entity

type SortedCloth struct {
	Sorted_id uint `gorm:"primaryKey;autoIncrement"`
	Sorted_quantity int
	Sorted_basketCode uint

	ClothType_id uint
	ClothType ClothType `gorm:"foreignKey:ClothType_id"`
}