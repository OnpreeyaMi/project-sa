package main


import (
	"fmt"
	"project-sa/config"
	"project-sa/entity"
	



)

func main() {
	// เชื่อมต่อฐานข้อมูล
	config.ConnectDatabase()

	// สร้างตารางตาม entity ที่เรามี
	config.DB.AutoMigrate(
		//payment table
        &entity.Payment{},
        &entity.Bill{},
        &entity.History{},
        &entity.Orders{},
		//complaint table
		&entity.Customer{},
		&entity.Employee{},
		&entity.Complaint{},
		&entity.ReplyComplaint{},
		&entity.HistoryComplain{},
        
	)

	fmt.Println("สร้างตารางเรียบร้อย!")
}
