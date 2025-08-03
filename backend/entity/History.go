package entity

type History struct {
	HistoryID    uint      `gorm:"primaryKey;autoIncrement"`
 	OrderID      uint
	BasketID     uint
	CustomerID   uint
	DetergentID  uint
	PaymentID 	 uint
	ProcessID  uint
	LaundryProcess LaundryProcess `gorm:"foreignKey:ProcessID;references:ProcessID"`

	Orders     Order     `gorm:"foreignKey:OrderID"`
	Baskets    Basket    `gorm:"foreignKey:BasketID"`
	Customers  Customer  `gorm:"foreignKey:CustomerID"`
	Detergents Detergent `gorm:"foreignKey:DetergentID"`
	Payments   Payment   `gorm:"foreignKey:PaymentID"`
}
