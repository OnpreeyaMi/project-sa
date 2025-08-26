package entity
import (
	"gorm.io/gorm"
)

type EmpPosition struct {
	gorm.Model
	Position_ID uint `gorm:"primaryKey;autoIncrement"`
	Position_name string

	Emp_ID uint
	Position_count_id uint
	Employee []Employee `gorm:"foreignKey:Emp_ID"`
	PositionCount []PositionCount `gorm:"foreignKey:Position_count_id"`
}