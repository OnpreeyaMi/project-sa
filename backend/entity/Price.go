package entity

type Price struct {
	PriceMachinr_id uint `gorm:"primaryKey;autoIncrement"`
	Price uint
	
	WashingMachines Machine  `gorm:"foreignKey:machine_id"`

}