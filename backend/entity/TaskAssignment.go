package entity
import (
	"time"
)

type Assignment struct {
	Task_id   uint      `gorm:"primaryKey;autoIncrement"`
	TaskType string
	RefID   uint
	AssignedDate time.Time

	Employee_id uint
	Employees []Employee `gorm:"foreignKey:Employee_id"`
}