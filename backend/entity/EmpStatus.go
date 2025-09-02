package entity
import (
	"gorm.io/gorm"
)


type EmpStatus struct {
	gorm.Model
	Status_ID uint `gorm:"primaryKey" json:"status_id"`
	StatusName string `json:"status_name"`
	StatusDescription string `json:"status_description"`

	Emp_ID uint
	EmployeeStatus []*EmployeeStatus `gorm:"foreignKey:Emp_ID"`
}