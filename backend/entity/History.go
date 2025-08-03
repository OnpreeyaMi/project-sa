package entity

import (
	"gorm.io/gorm"

)

type History struct {
	gorm.Model
 	OrderID      uint
	BasketID     uint
	CustomerID   uint
	DetergentID  uint
	Payment_id 	 uint
	Process_id  uint



	Orders     Order     `gorm:"foreignKey:OrderID"`
	Baskets    Basket    `gorm:"foreignKey:BasketID"`
	Customers  Customer  `gorm:"foreignKey:CustomerID"`
	Detergents Detergent `gorm:"foreignKey:DetergentID"`
	Payments   Payment   `gorm:"foreignKey:PaymentID"`
	LaundryProcesses   LaundryProcess   `gorm:"foreignKey:ProcessID"`


}
