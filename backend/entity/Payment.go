package entity

import (
    
    "time"
    "gorm.io/gorm"
    
)

type Payment struct {
    // PaymentID    uint      `gorm:"primaryKey;autoIncrement"`
    gorm.Model
    PaymentType  string
    CreatedDate  time.Time
    CheckPayment []byte
    TotalAmount  int
    PaymentStatus string
    OrderID      uint


    Histories    []*History     `gorm:"foreignKey:PaymentID"`
    

}




