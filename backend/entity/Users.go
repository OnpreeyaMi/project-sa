package entity

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Email    string `gorm:"uniqueIndex" json:"email"`
	Password string `json:"password"` // ส่งกลับ “ค่าแฮช”

	RoleID uint  `json:"roleId"`
	Role   *Role `gorm:"foreignKey:RoleID" json:"Role,omitempty"`

	Customers []*Customer `gorm:"foreignKey:UserID" json:"-"`

	PurchaseDetergent  uint                 `json:"-"`
	PurchaseDetergents []*PurchaseDetergent `gorm:"foreignKey:UserID;references:ID" json:"-"`

	Employee *Employee `gorm:"foreignKey:UserID" json:"Employee,omitempty"`
}
