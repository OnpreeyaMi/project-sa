package entity


type OrderDetergents struct {
	OrderID     uint `gorm:"primaryKey"`
    DetergentID uint `gorm:"primaryKey"`
}