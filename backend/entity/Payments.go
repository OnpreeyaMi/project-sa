package entity

import "time"

type Payment struct {
	Payment_id uint `gorm:"primaryKey;autoIncrement"`
	Bill uint
	Payment string
	CreateDate time.Time
	Check_payment time.Time
	Payment_status string


	Orders Order `gorm:"foreignKey:Order_id"`
	Prices Price  `gorm:"foreignKey:Price_id"`

}