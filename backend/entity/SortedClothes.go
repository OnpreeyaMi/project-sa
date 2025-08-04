package entity

type SortedCloth struct {
	SortedID uint `gorm:"primaryKey;autoIncrement"`
	Sorted_quantity int
	Sorted_basketCode uint

	ClothTypeID uint
	ClothType ClothType `gorm:"foreignKey:ClothTypeID"`

	SortingRecord  []SortingRecord `gorm:"foreignKey:SortedID;references:SortedID"`
	
}