package config

import (
	"fmt"

	"github.com/OnpreeyaMi/project-sa/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	// สร้างไฟล์ฐานข้อมูล SQLite (ถ้ายังไม่มี)
	database, err := gorm.Open(sqlite.Open("sa_laundry.db"), &gorm.Config{})
	if err != nil {
		panic("ไม่สามารถเชื่อมต่อฐานข้อมูลได้")
	}

	DB = database
	fmt.Println("เชื่อมต่อ SQLite สำเร็จ!")
}


func SetupDatabase() {

	// AutoMigrate สำหรับทุก entity
	err := DB.AutoMigrate(
		&entity.Customer{},
		&entity.Address{},
		&entity.Order{},
		&entity.ServiceType{},
		&entity.Detergent{},
		&entity.Payment{},
		&entity.History{},
		&entity.LaundryProcess{},
		
	)
	if err != nil {
		fmt.Println("Error in AutoMigrate:", err)
	} else {
		fmt.Println("AutoMigrate completed successfully.")
	}

}