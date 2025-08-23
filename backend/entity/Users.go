package entity

import "gorm.io/gorm"

type User struct {
	gorm.Model
	//UserID    uint   `gorm:"primaryKey;autoIncrement"`
	Email    string
	Password string
	
	RoleID uint
	Role Role `gorm:"foreignKey:UserID"`

	CustomerID uint
	Customer *Customer `gorm:"foreignKey:CustomerID;references:ID"`
	
	Employee Employee `gorm:"foreignKey:UserID;references:ID"`
}