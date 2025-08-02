package entity

import(
	"gorm.io/gorm"
	"time"
)

type Detegent struct {
	gorm.Model
	Name        string
	Type		string
	InStock		int
	LastUpdated	time.Time

	Orders []Order `gorm:"many2many:Order_detergents;"`
}