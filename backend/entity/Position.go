package entity

type EmpPosition struct {
	EmpPositionID uint `gorm:"primaryKey;autoIncrement"`
	EmpPosition_name string

	Employees []Employee `gorm:"foreignKey:EmpPositionID;references:EmpPositionID"`
}