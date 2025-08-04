package entity

type ClothType struct {
	ClothTypeID uint `gorm:"primaryKey;autoIncrement"`
	Type_name string
}