package entity
import (
	"gorm.io/gorm"
)


type EmployeeStatus struct {
	gorm.Model
	StatusName 			string
	StatusDescription 	string 

	Employees []*Employee `gorm:"foreignKey:EmployeeStatusID"`
	
}