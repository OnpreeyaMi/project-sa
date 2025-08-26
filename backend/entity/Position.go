package entity

type EmpPosition struct {
	PositionID uint `gorm:"primaryKey;autoIncrement"`
	Position_name string
	
}