package entity

import(
	"time"
	"gorm.io/gorm"
) 	

type Customer struct {
	// CustomerID  uint      `gorm:"column:customer_id;primaryKey;autoIncrement"`
	gorm.Model
	FirstName   string    `gorm:"column:first_name"`
	LastName    string    `gorm:"column:last_name"`
	PhoneNumber string    `gorm:"column:phone_number"` // เก็บเป็น string ปลอดภัยกว่า
	CreatedDate time.Time `gorm:"column:created_date"`
	IsVerified  bool      `gorm:"column:is_verified"`
	Gender      string    `gorm:"column:gender"`
	UserID      *uint     `gorm:"column:user_id"`    // FK (ตาราง user ไม่แสดงใน ERD)
	AddressID   *uint     `gorm:"column:address_id"` // FK (ตาราง address ไม่แสดงใน ERD)

	// Relations
	
	Complaints []Complaint `gorm:"foreignKey:CustomerID;references:ID"`
}

func (Customer) TableName() string { return "customers" }
