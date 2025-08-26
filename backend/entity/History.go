package entity

type History struct {
    PaymentHistoryID uint   `gorm:"primaryKey;autoIncrement"`
    PaymentStatus    string
    PaymentID        uint
    Payment          Payment `gorm:"foreignKey:PaymentID"`
}