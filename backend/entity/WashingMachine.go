package entity

type Machine struct {
	Macchine_id uint `gorm:"primaryKey;autoIncrement"`
	Capacity_kg uint 
	Status string
	Machine_type uint

}