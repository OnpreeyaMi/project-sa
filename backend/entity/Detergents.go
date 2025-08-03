package entity

import(
	"gorm.io/gorm"
	"time"
)

type Detergent struct {
	gorm.Model
	Name        string
	Type		string
	InStock		int
	LastUpdated	time.Time
	Order_id	uint
	Orders []Order `gorm:"many2many:Order_detergents;"`
}