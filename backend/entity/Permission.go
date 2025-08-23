package entity

import "gorm.io/gorm"

type Permission struct {
	gorm.Model
	//PermissionID uint   `gorm:"primaryKey;autoIncrement"`
	Permission_name string
	
	Roles []Role `gorm:"many2many:RolePermission"`
}