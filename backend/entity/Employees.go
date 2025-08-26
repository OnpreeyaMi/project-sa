package entity

import (
	"time"
	"gorm.io/gorm"
)

type Employee struct {
	gorm.Model
	FirstName    	string   
	LastName     	string
	Email       	string
	Password      	string
	Phone      		string
	Gender    	    string
	StartDate       time.Time

	
	UserID uint
	User *User `gorm:"foreignKey:UserID"`

	PositionID uint
	Position *Position `gorm:"foreignKey:PositionID"`
	
	EmployeeStatusID uint
	EmployeeStatus *EmployeeStatus `gorm:"foreignKey:EmployeeStatusID"`
}
