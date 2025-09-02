package entity

import (
	"gorm.io/gorm"
)

type Role struct {
	gorm.Model
	Role_name string

	Users []*User `gorm:"foreignKey:RoleID;references:ID"`
}