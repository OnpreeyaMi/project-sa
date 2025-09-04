package entity

import (
	"time"
	"gorm.io/gorm"
)

type Employee struct {
    gorm.Model
    Code      string    `gorm:"uniqueIndex;size:16"` // <- เพิ่ม
    FirstName string   
    LastName  string   
    Phone     string    
    Gender    string    
    StartDate time.Time 

    UserID uint  
    User   *User `gorm:"foreignKey:UserID"`

    PositionID uint      
    Position   *Position `gorm:"foreignKey:PositionID"`

    EmployeeStatusID uint           
    EmployeeStatus   *EmployeeStatus `gorm:"foreignKey:EmployeeStatusID"`
}

