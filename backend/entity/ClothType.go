package entity

type ClothType struct {
	ClothType_id uint `gorm:"primaryKey;autoIncrement"`
	Type_name string
}