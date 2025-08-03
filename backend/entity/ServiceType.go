package entity

type Servicetype struct {
	ServiceType_id uint `gorm:"primaryKey;autoIncrement"`
	Tempetature uint 
	Name string
	Description string
	Price uint 

}