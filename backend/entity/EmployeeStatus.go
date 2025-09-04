package entity

import "gorm.io/gorm"

type EmployeeStatus struct {
	gorm.Model
	StatusName        string       // เช่น active / inactive / onleave
	StatusDescription string       // คำอธิบาย

	Employees []*Employee `gorm:"foreignKey:EmployeeStatusID"`
}
                                 
