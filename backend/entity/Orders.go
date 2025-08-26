package entity

import (
	"gorm.io/gorm"
)

type Order struct {
	gorm.Model
	CustomerID uint
	Customer   *Customer `gorm:"foreignKey:CustomerID;"`
	Servicetypes   []ServiceType `gorm:"many2many:OrderServicetypes;"`
	Detergents []Detergent `gorm:"many2many:OrderDetergents;"`
	OrderImage string
	OrderNote string
	Process []Process `gorm:"many2many:OrderProcess;"`
	OrderHistory []OrderHistory `gorm:"foreignKey:OrderID;"`
	Address []Address `gorm:"foreignKey:OrderID;"`
	Usages []Usage `gorm:"foreignKey:OrderID;"`
	Queues []Queue `gorm:"foreignKey:OrderID;"`
	SortingRecord SortingRecord `gorm:"foreignKey:OrderID;"`
	PromotionUsage PromotionUsage `gorm:"foreignKey:OrderID;"`
	Payment Payment `gorm:"foreignKey:OrderID;"`
}

