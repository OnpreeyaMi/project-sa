package entity

import "gorm.io/gorm"

type Bill struct {
    gorm.Model
    PaymentID uint
    Payment   *Payment `gorm:"foreignKey:PaymentID;references:ID"`
}
