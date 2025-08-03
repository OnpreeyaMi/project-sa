package entity

type Machine struct {
	Macchine_id uint `gorm:"primaryKey;WashingMachine"`
	Capacity_kg uint 
	Status string
	Machine_type uint

}