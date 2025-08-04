package entity

type ClothType struct {
	ClothTypeID uint `gorm:"primaryKey;autoIncrement"`
	Type_name string

	SortedCloth *SortedCloth `gorm:"foreignKey:ClothTypeID;references:ClothTypeID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
}