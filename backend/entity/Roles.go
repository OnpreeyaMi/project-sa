package entity

type Role struct {
	RoleID   uint   `gorm:"primaryKey;autoIncrement"`
	Role_name string

	UserID uint
	Users []User `gorm:"foreignKey:RoleID"`

	Permission []Permission `gorm:"many2many:RolePermission"`

}