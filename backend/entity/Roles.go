package entity

import (
	"gorm.io/gorm"
)

type Role struct {
	gorm.Model
	Name string

	Users []*User `gorm:"foreignKey:RoleID;references:ID"`


}