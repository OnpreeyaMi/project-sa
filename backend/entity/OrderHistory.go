package entity

import (
	"gorm.io/gorm"
)
//ประวัติการสร้างออเดอร์
type OrderHistory struct {
	gorm.Model
	OrderID uint
	Order   *Order `gorm:"foreignKey:OrderID;"`
	Status  string
	
<<<<<<< HEAD
}
=======
}
>>>>>>> ae0b4f670b0322212318d085cd9a6f1b63f7af06
