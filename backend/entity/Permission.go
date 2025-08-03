package entity

type Permission struct {
	Permission_id uint   `gorm:"primaryKey;autoIncrement"`
	Permission_name string
	
	Role_id uint
	Roles []Role `gorm:"many2many:RolePermission"`
}