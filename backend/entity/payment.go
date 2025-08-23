package entity

import "gorm.io/gorm"

type Payment struct {
	gorm.Model
	Bill          int
	PaymentType   string
	CreatedAtTime string
	CheckPayment  bool
	OrderID       uint
	StatusPayment string
	Price         float64
	TotalAmount   float64
}
