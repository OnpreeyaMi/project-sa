package entity

type Servicetype struct {
	ServiceType_id uint `gorm:"primaryKey;ServiceType"`
	Tempetature uint 
	Name string
	Description string
	Price uint 

}