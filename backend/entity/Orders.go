package entity

type Orders struct {
    OrderID    uint   `gorm:"primaryKey;autoIncrement"`
    OrderImage string
    OrderNote  string
}