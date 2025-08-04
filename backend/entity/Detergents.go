package entity

import(
	"time"
)

type Detergent struct {
	DetergentID uint `gorm:"primaryKey;autoIncrement"`
	Name        string
	Type		string
	InStock		int
	LastUpdated	time.Time
	
	OrderID	uint
	Orders []Order `gorm:"many2many:OrderDetergents;"`
}