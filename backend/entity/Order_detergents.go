package entity
import (
	//"time"
)

type OrderDetergents struct {
	OrderID     uint `gorm:"primaryKey"`
    DetergentID uint `gorm:"primaryKey"`
}