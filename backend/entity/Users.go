package entity

type User struct {
	UserID    uint   `gorm:"primaryKey;autoIncrement"`
	Email    string
	Password string
	
	RoleID uint
	Role Role `gorm:"foreignKey:UserID"`

	CustomerID uint
	Customer *Customer `gorm:"foreignKey:CustomerID;references:CustomerID"`
	
	Employee Employee `gorm:"foreignKey:UserID;references:UserID"`
}