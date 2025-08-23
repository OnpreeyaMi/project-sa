package entity

import "gorm.io/gorm"

type History struct {
	gorm.Model
	OrderID         uint
	BasketID        uint
	PaymentStatusID uint
	ProcessID       uint
}
