package entity

import (
	"gorm.io/gorm"
)

type Role struct {
	gorm.Model
	Name string

	UserID uint
	Users []*User `gorm:"foreignKey:RoleID;references:ID"`


}