package entity

type User struct {
	UserID    uint   `gorm:"primaryKey;autoIncrement"`
	Email    string
	Password string
	
	RoleID uint
	Roles Role `gorm:"foreignKey:RoleID"`
	
}