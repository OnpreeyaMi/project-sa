package entity

import (
    
    "time"
    
)

type Payment struct {
    PaymentID    uint      `gorm:"primaryKey;autoIncrement"`
    PaymentType  string
    CreatedDate  time.Time
    CheckPayment []byte
    TotalAmount  int
    PaymentStatus string
    BillID       uint
    OrderID      uint


    Bills        []Bill        `gorm:"foreignKey:PaymentID"`
    Histories    []History     `gorm:"foreignKey:PaymentID"`
    

}




