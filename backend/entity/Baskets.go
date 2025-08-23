package entity

import "gorm.io/gorm"

type Basket struct {
	gorm.Model
	//BasketID      uint `gorm:"primaryKey;autoIncrement"`
	Basket_status string

	OrderID uint
	Order   *Order `gorm:"foreignKey:OrderID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	HistoryID uint
	History *History `gorm:"foreignKey:HistoryID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
}
