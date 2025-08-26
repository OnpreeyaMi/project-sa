package entity

type SortedCloth struct {
	SortedID uint `gorm:"primaryKey;autoIncrement"`
	Sorted_quantity int
	Sorted_basketCode uint

	SortingID uint
	ClothType ClothType `gorm:"foreignKey:ClothTypeID"`
}