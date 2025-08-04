package entity

type Price struct {
	PriceMachinrID uint `gorm:"primaryKey;autoIncrement"`
	Price uint
	
	MachineID uint
	WashingMachines Machine  `gorm:"foreignKey:MachineID"`

}