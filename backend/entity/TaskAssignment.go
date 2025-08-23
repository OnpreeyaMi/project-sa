package entity

import (
	"time"

	"gorm.io/gorm"
)

type Assignment struct {
	gorm.Model
	//TaskID   uint      `gorm:"primaryKey;autoIncrement"`
	TaskType string
	RefID   uint
	AssignedDate time.Time

	EmployeeID uint
	Employees []Employee `gorm:"many2many:TaskAssignment;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
}