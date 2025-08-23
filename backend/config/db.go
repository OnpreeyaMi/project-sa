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

	// ใส่ mock data หลัง AutoMigrate
	MockData()
}

func MockData() {
	// --- Mock Customers ---
	customers := []entity.Customer{
		{FirstName: "Nuntawut", LastName: "K.", Email: "nuntawut@example.com", PhoneNumber: "0812345678", Gender: "Male", IsVerified: true},
		{FirstName: "Alice", LastName: "B.", Email: "alice@example.com", PhoneNumber: "0898765432", Gender: "Female", IsVerified: false},
	}
	for _, c := range customers {
		DB.FirstOrCreate(&c, entity.Customer{Email: c.Email})
	}

	// --- Mock Address ---
	addresses := []entity.Address{
		{CustomerID: 1, AddressDetail: "123 Main St, Bangkok", Latitude: 13.7563, Longitude: 100.5018, IsDefault: true},
		{CustomerID: 2, AddressDetail: "456 Second St, Chiang Mai", Latitude: 18.7883, Longitude: 98.9853, IsDefault: true},
	}
	for _, a := range addresses {
		DB.FirstOrCreate(&a, entity.Address{CustomerID: a.CustomerID, AddressDetail: a.AddressDetail})
	}

	// --- Mock ServiceType ---
	services := []entity.ServiceType{
		{Type: "Wash & Fold", Price: 50, Capacity: 10},
		{Type: "Dry Clean", Price: 120, Capacity: 5},
	}
	for _, s := range services {
		DB.FirstOrCreate(&s, entity.ServiceType{Type: s.Type})
	}

	// --- Mock Detergent ---
	detergents := []entity.Detergent{
		{Type: "Liquid", Stock: 100, Price: 20, LastUpdateDate: "2025-08-01"},
		{Type: "Powder", Stock: 50, Price: 15, LastUpdateDate: "2025-08-05"},
	}
	for _, d := range detergents {
		DB.FirstOrCreate(&d, entity.Detergent{Type: d.Type})
	}

	// --- Mock Orders ---
	orders := []entity.Order{
		{OrderNo: "ORD001", OrderDate: "2025-08-20", Status: "Completed", CustomerID: 1, AddressID: 1, ServiceID: 1},
		{OrderNo: "ORD002", OrderDate: "2025-08-21", Status: "Pending", CustomerID: 2, AddressID: 2, ServiceID: 2},
	}
	for _, o := range orders {
		DB.FirstOrCreate(&o, entity.Order{OrderNo: o.OrderNo})
	}

	// --- Mock Payments ---
	payments := []entity.Payment{
		{Bill: 1, PaymentType: "Credit Card", CreatedAtTime: "2025-08-20 10:00", CheckPayment: true, OrderID: 1, StatusPayment: "Paid", Price: 150, TotalAmount: 150},
		{Bill: 2, PaymentType: "Cash", CreatedAtTime: "2025-08-21 14:00", CheckPayment: false, OrderID: 2, StatusPayment: "Unpaid", Price: 240, TotalAmount: 240},
	}
	for _, p := range payments {
		DB.FirstOrCreate(&p, entity.Payment{Bill: p.Bill})
	}

	// --- Mock LaundryProcess ---
	processes := []entity.LaundryProcess{
		{Step: "Washing", StartTime: 9.00, EndTime: 10.00, OrderID: 1, ServiceID: 1, MachineID: 101},
		{Step: "Drying", StartTime: 10.15, EndTime: 11.00, OrderID: 1, ServiceID: 1, MachineID: 202},
	}
	for _, lp := range processes {
		DB.Create(&lp)
	}

	// --- Mock History ---
	histories := []entity.History{
		{OrderID: 1, BasketID: 1001, PaymentStatusID: 1, ProcessID: 1},
		{OrderID: 2, BasketID: 1002, PaymentStatusID: 2, ProcessID: 2},
	}
	for _, h := range histories {
		DB.Create(&h)
	}

	fmt.Println("Mock data added successfully!")
}
