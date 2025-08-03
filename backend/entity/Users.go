package entity

type User struct {
	User_id    uint   `gorm:"primaryKey;autoIncrement"`
	Email    string
	Password string
	Role_id uint
	Roles Role `gorm:"foreignKey:Role_id"`
	
}