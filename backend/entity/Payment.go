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



<<<<<<< HEAD

=======
>>>>>>> ae0b4f670b0322212318d085cd9a6f1b63f7af06
