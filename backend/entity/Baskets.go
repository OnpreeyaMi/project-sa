package entity

type Basket struct {
	BasketID uint `gorm:"primaryKey;autoIncrement"`
	Basket_status string

	OrderID uint
	Order Order `gorm:"foreignKey:OrderID;references:OrderID"`
}