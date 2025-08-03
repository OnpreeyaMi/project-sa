package entity

type Permission struct {
	PermissionID uint   `gorm:"primaryKey;autoIncrement"`
	Permission_name string
	
	RoleID uint
	Roles []Role `gorm:"many2many:RolePermission"`
}