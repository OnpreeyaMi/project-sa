package entity
import (
	"gorm.io/gorm"
)


import (
	"gorm.io/gorm"
)

type EmployeeStatus struct {
	gorm.Model
	StatusID    uint     `json:"status_id"`
	EmpID       uint     `json:"emp_id"`
}