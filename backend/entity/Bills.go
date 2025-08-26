package entity

type Bill struct {
    BillID    uint `gorm:"primaryKey;autoIncrement"`
    PaymentID uint
    Payment   Payment `gorm:"foreignKey:PaymentID"`
}