package entity

type Basket struct {
	Basket_id uint `gorm:"primaryKey;Baskets"`
	Basket_status string
	Orders Order `gorm:"foreignKey:Order_id"`
}