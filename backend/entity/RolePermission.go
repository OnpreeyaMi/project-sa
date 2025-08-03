package entity

type RolePermission struct {
	Role_id       uint `gorm:"primaryKey"`
	Permission_id uint `gorm:"primaryKey"`
}
