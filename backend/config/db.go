package config

import (
	"fmt"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/OnpreeyaMi/project-sa/entity"
)

var DB *gorm.DB

func ConnectDatabase() {
	database, err := gorm.Open(sqlite.Open("sa_laundry.db"), &gorm.Config{})
	if err != nil {
		panic("ไม่สามารถเชื่อมต่อฐานข้อมูลได้")
	}
	DB = database
	fmt.Println("เชื่อมต่อ SQLite สำเร็จ!")
}

func SetupDatabase() {
	// สร้างตารางตามโมเดล (ไม่มีการใส่ mock data)
	err := DB.AutoMigrate(
		&entity.Address{},
		&entity.ClothType{},
		&entity.Complaint{},
		&entity.Customer{},
		&entity.DetergentCategory{},
		&entity.Detergent{},
		&entity.Employee{},
		&entity.EmployeeStatus{},
		&entity.LaundryProcess{},
		&entity.Machine{},
		&entity.Order{},
		&entity.OrderHistory{},
		&entity.Payment{},
		&entity.PositionCount{},
		&entity.Position{},
		&entity.PurchaseDetergent{},
		&entity.Queue{},
		&entity.QueueAssignment{},
		&entity.QueueHistory{},
		&entity.ReplyComplaint{},
		&entity.ServiceType{},
		&entity.SortedClothes{},
		&entity.SortingRecord{},
		&entity.SortingHistory{},
		&entity.TimeSlot{},
		&entity.User{},
		&entity.Gender{},
		&entity.History{},
		&entity.HistoryComplain{},
		&entity.Promotion{},
		&entity.PromotionCondition{},
		&entity.PromotionUsage{},
		&entity.Role{},
		&entity.DiscountType{},
	)
	if err != nil {
		fmt.Println("Error in AutoMigrate:", err)
	} else {
		fmt.Println("AutoMigrate completed successfully.")
	}
}
