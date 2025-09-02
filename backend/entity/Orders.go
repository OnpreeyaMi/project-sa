package entity

import (
	"gorm.io/gorm"
)

type Order struct {
	gorm.Model
	CustomerID 			uint
	Customer   			*Customer `gorm:"foreignKey:CustomerID;"`

	ServiceTypes   		[]*ServiceType `gorm:"many2many:OrderServiceType;"`
	Detergents 			[]*Detergent `gorm:"many2many:OrderDetergents;"`
	OrderImage 			string
	OrderNote 			string
	LaundryProcesses 	[]*LaundryProcess `gorm:"many2many:OrderProcess;"`
	// OrderHistories 		[]*OrderHistory `gorm:"foreignKey:OrderID;"`
	AddressID 			uint
	Address 			*Address `gorm:"foreignKey:AddressID;"`
	Queues 				[]*Queue `gorm:"foreignKey:OrderID;"`
	SortingRecord 		*SortingRecord `gorm:"foreignKey:OrderID;"`
	PromotionUsage 		*PromotionUsage `gorm:"foreignKey:OrderID;"`
	Payment 			*Payment `gorm:"foreignKey:OrderID;"`	
}

