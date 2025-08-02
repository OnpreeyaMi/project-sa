package entity

import (
	"gorm.io/gorm"
	"time"
)

type History struct {
	gorm.Model
 	OrderID      uint
	BasketID     uint
	CustomerID   uint
	DetergentID  uint
	Payment_id 	 uint
	Process_id  uint

	Order     Order     `gorm:"foreignKey:OrderID"`
	Basket    Basket    `gorm:"foreignKey:BasketID"`
	Customer  Customer  `gorm:"foreignKey:CustomerID"`
	Detergent Detergent `gorm:"foreignKey:DetergentID"`
	Payment   Payment   `gorm:"foreignKey:PaymentID"`
	Process   Process   `gorm:"foreignKey:ProcessID"`

}
