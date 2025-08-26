package entity

import "gorm.io/gorm"

// History.go
type History struct {
    gorm.Model
    PaymentStatus string
    PaymentID     uint
    Payment       Payment `gorm:"foreignKey:PaymentID;references:ID"` // <-- ใส่ให้ชัด
}
