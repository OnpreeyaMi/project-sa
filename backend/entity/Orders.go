package entity

import (
	"time"
)

type Order struct{
	OrderID uint `gorm:"primaryKey;autoIncrement"`
	PickupDate 	time.Time
	CustomerID uint
	MachineID uint
	DetergentID uint
	AddressID uint
	Order_image string
	Order_note	string
	ComplaintID uint

	Customer Customer `gorm:"foreignKey:CustomerID;references:CustomerID"`
	WashingMachine Machine `gorm:"foreignKey:MachineID;references:MacchineID"`
	Address Address `gorm:"foreignKey:AddressID;references:AddressID"`
	Complaint *Complaint `gorm:"foreignKey:ComplaintID;references:ComplaintID"`
	Detergents []Detergent `gorm:"many2many:Order_detergents;"`
	Addresses Address `gorm:"foreignKey:AddressID;references:AddressID"`

}