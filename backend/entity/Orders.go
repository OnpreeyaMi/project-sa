package entity

import (
	//"gorm.io/gorm"
	"time"
)

type Order struct{
	//gorm.Model
	Order_id uint `gorm:"primaryKey;autoIncrement"`
	PickupDate 	time.Time
	Customer_id uint
	Machine_id uint
	Detergent_id uint
	Address_id uint
	Order_image string
	Order_note	string
	Complaint_id uint
	
	Complaint []Complaint `gorm:"foreignKey:Complaint_id"`
	Customers Customer `gorm:"foreignKey:customer_id"`
	WashingMachine Machine `gorm:"foreignKey:machine_id"`
	Detergents []Detergent `gorm:"many2many:Order_detergents;"`
	Addresses Address `gorm:"foreignKey:address_id"`

}