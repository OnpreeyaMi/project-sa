package entity

import (
	"time"
	"gorm.io/gorm"
)

type Employee struct {
    gorm.Model
    Code      string    `gorm:"uniqueIndex;size:16" json:"employeeCode"` // <- เพิ่ม
    FirstName string    `json:"firstName"`
    LastName  string    `json:"lastName"`
    Phone     string    `json:"phone"`
    Gender    string    `json:"gender"`
    StartDate time.Time `json:"startDate"`

    UserID uint  `json:"userId"`
    User   *User `gorm:"foreignKey:UserID" json:"User,omitempty"`

    PositionID uint      `json:"positionID"`
    Position   *Position `gorm:"foreignKey:PositionID" json:"Position,omitempty"`

    EmployeeStatusID uint            `json:"employeeStatusId"`
    EmployeeStatus   *EmployeeStatus `gorm:"foreignKey:EmployeeStatusID" json:"EmployeeStatus,omitempty"`
}

