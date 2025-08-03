package entity
import (
	"time"
)

type Assignment struct {
	TaskID   uint      `gorm:"primaryKey;autoIncrement"`
	TaskType string
	RefID   uint
	AssignedDate time.Time

	EmployeeID uint
	Employees []Employee `gorm:"foreignKey:EmployeeID"`
}