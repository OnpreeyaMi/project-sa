package entity

type Basket struct {
	Basket_id uint `gorm:"primaryKey;autoIncrement"`
	Basket_status string
	Orders Order `gorm:"foreignKey:Order_id"`
}