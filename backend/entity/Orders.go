package entity

import "gorm.io/gorm"
type Orders struct {
    // OrderID    uint   `gorm:"primaryKey;autoIncrement"`
    gorm.Model
    OrderImage string
    OrderNote  string
}