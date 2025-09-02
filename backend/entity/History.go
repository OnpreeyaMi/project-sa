package entity

import "gorm.io/gorm"

// History.go
type History struct {
    gorm.Model
    PaymentStatus string
    PaymentID     uint
    Payment       *Payment `gorm:"foreignKey:PaymentID;references:ID"` // <-- ใส่ให้ชัด
<<<<<<< HEAD
}
=======
    
}
>>>>>>> ae0b4f670b0322212318d085cd9a6f1b63f7af06
