package entity

type Basket struct {
	BasketID      uint `gorm:"primaryKey;autoIncrement"`
	Basket_status string

	OrderID uint
	Order   *Order `gorm:"foreignKey:OrderID;references:OrderID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	HistoryID uint
	History *History `gorm:"foreignKey:HistoryID;references:HistoryID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
}
