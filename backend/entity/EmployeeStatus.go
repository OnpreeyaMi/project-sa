package entity

import "gorm.io/gorm"

type EmployeeStatus struct {
	gorm.Model
	StatusName        string       `json:"StatusName"`        // เช่น active / inactive / onleave
	StatusDescription string       `json:"StatusDescription"` // คำอธิบาย

	Employees []*Employee `gorm:"foreignKey:EmployeeStatusID" json:"-"`
}
                                 
