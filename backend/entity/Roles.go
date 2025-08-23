package entity

import "gorm.io/gorm"

type Role struct {
	gorm.Model
	//RoleID   uint   `gorm:"primaryKey;autoIncrement"`
	Role_name string

	UserID uint
	Users []User `gorm:"foreignKey:RoleID"`

	Permission []Permission `gorm:"many2many:RolePermission"`

}