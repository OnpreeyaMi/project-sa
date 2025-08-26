package entity

import (
	"gorm.io/gorm"
)
//ประวัติการสร้างออเดอร์
type OrderHistory struct {
	gorm.Model
	//OrderID uint
	Order   *Order `gorm:"foreignKey:OrderID;"`
	Status  string
	
}
