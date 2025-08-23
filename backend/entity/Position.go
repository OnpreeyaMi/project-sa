package entity

import "gorm.io/gorm"

type EmpPosition struct {
	gorm.Model
	//EmpPositionID uint `gorm:"primaryKey;autoIncrement"`
	EmpPosition_name string

	Employees []Employee `gorm:"foreignKey:EmpPositionID;references:ID"`
}