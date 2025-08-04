package entity

import "time"

type Payment struct {
	PaymentID uint `gorm:"primaryKey;autoIncrement"`
	Bill uint
	Payment string
	CreateDate time.Time
	Check_payment time.Time
	Payment_status string

	OrderID uint
	Orders Order `gorm:"foreignKey:OrderID"`
	PriceID uint
	Prices Price  `gorm:"foreignKey:PriceID"`

	HistoryID uint
	History History `gorm:"foreignKey:HistoryID;references:HistoryID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

}