package entity

import "gorm.io/gorm"

type User struct {
	gorm.Model
<<<<<<< HEAD
	Email    string `gorm:"uniqueIndex" json:"Email"`
	Password string `json:"Password"` // ส่งกลับ “ค่าแฮช”
=======
	Email    string `gorm:"uniqueIndex" json:"email"`
	Password string `json:"password"` // ส่งกลับ “ค่าแฮช”
>>>>>>> b70f88cba87f12bf976b9aa61ab650e6269c54ee

	RoleID uint  `json:"RoleID"`
	Role   *Role `gorm:"foreignKey:RoleID" json:"Role,omitempty"`

	Customers []*Customer `gorm:"foreignKey:UserID" json:"-"`

	PurchaseDetergent  uint                 `json:"-"`
	PurchaseDetergents []*PurchaseDetergent `gorm:"foreignKey:UserID;references:ID" json:"-"`

	Employee *Employee `gorm:"foreignKey:UserID" json:"Employee,omitempty"`
	DetergentUsageHistories []DetergentUsageHistory `gorm:"foreignKey:UserID"`
}
