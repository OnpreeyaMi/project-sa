package entity

type Role struct {
	Role_id   uint   `gorm:"primaryKey;autoIncrement"`
	Role_name string

	User_id uint
	Users []User `gorm:"foreignKey:Role_id"`
	Permission_id uint
	Permission []Permission `gorm:"many2many:RolePermission"`

}