package entity

type Machine struct {
	MacchineID uint `gorm:"primaryKey;autoIncrement"`
	Capacity_kg uint 
	Status string
	Machine_type uint

}