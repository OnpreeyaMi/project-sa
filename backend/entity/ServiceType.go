package entity

type Servicetype struct {
	ServiceTypeID uint `gorm:"primaryKey;autoIncrement"`
	Tempetature uint 
	Name string
	Description string
	Price uint 

}