package main

import (
    "fmt"
	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
)

func main() {
	// เชื่อมต่อฐานข้อมูล
	config.ConnectDatabase()

	// สร้างตารางตาม entity ที่เรามี
	config.DB.AutoMigrate(
		// &entity.Address{},
        // &entity.AuditLog{},
        // &entity.Basket{},
        // &entity.ClothType{},
        // &entity.Complaint{},
        // &entity.Customer{},
        &entity.Detergent{},
        &entity.PurchaseDetergent{},
        // &entity.Employee{},
        &entity.OrderHistory{},
        // &entity.LaundryProcess{},
        //&entity.OrderDetergents{},
        &entity.Order{},
        // &entity.Payment{},
        // &entity.Permission{},
        // &entity.EmpPosition{},
        // &entity.Price{},
        // &entity.QueueAssignment{},
        // &entity.Queuehistory{},
        // &entity.Queue{},
        // &entity.ReplyComplaint{},
        // &entity.RolePermission{},
        // &entity.Role{},
        &entity.Servicetype{},
        // &entity.SortedCloth{},
        // &entity.SortingRecord{},
        // &entity.Assignment{},
        // &entity.Timeslot{},
        // &entity.User{},
        // &entity.Verification{},
        // &entity.Machine{},
	)

	fmt.Println("สร้างตารางเรียบร้อย!")
}
