package entity

import (
	"time"
)

type Order struct {
	OrderID        uint `gorm:"primaryKey;autoIncrement"`
	PickupDate     time.Time
	CustomerID     uint
	Customer       *Customer `gorm:"foreignKey:CustomerID;references:CustomerID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	Machine *Machine `gorm:"foreignKey:OrderID;references:OrderID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	
	Address        *Address `gorm:"foreignKey:OrderID;references:OrderID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	Order_image    string
	Order_note     string

	Queue *Queue `gorm:"foreignKey:OrderID;references:OrderID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	Complaint      *Complaint `gorm:"foreignKey:OrderID;references:OrderID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	Detergents []Detergent `gorm:"many2many:OrderDetergents"`

	LaundryProcesses []LaundryProcess `gorm:"foreignKey:OrderID;references:OrderID"`

	SortingRecord SortingRecord `gorm:"foreignKey:OrderID;references:OrderID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	Basket Basket `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	History []History `gorm:"foreignKey:OrderID;references:OrderID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	Payment *Payment `gorm:"foreignKey:OrderID;references:OrderID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	
}
