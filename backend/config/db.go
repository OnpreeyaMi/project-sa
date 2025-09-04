package config

import (
	"fmt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"github.com/OnpreeyaMi/project-sa/entity"
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
		&entity.Address{},
		&entity.ClothType{},
		&entity.Complaint{},
		&entity.Customer{},
		&entity.DetergentCategory{},
		&entity.Detergent{},
		&entity.DiscountType{},
		&entity.Employee{},
		&entity.EmployeeStatus{},
		&entity.Gender{},
		&entity.History{},
		&entity.HistoryComplain{},
		&entity.LaundryProcess{},
		&entity.Machine{},
		&entity.Order{},
		&entity.OrderHistory{},
		&entity.Payment{},
		&entity.PositionCount{},
		&entity.Position{},
		&entity.Promotion{},
		&entity.PromotionCondition{},
		&entity.PromotionUsage{},
		&entity.PurchaseDetergent{},
		&entity.Queue{},
		&entity.QueueAssignment{},
		&entity.QueueHistory{},
		&entity.ReplyComplaint{},
		&entity.Role{},
		&entity.ServiceType{},
		&entity.SortedClothes{},
		&entity.SortingRecord{},
		&entity.SortingHistory{},
		&entity.TimeSlot{},
		&entity.User{},

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
		{FirstName: "Nuntawut", LastName: "K.", PhoneNumber: "0812345678", GenderID: 1,  IsVerified: true},
		{FirstName: "Alice", LastName: "B.", PhoneNumber: "0898765432", GenderID: 1, IsVerified: false},
	}
	for _, c := range customers {
		DB.FirstOrCreate(&c, entity.Customer{PhoneNumber: c.PhoneNumber})
	}

	//--- Mock Address ---
	addresses := []entity.Address{
		{CustomerID: 1, AddressDetails: "123 Main St, Bangkok", Latitude: 13.7563, Longitude: 100.5018, IsDefault: true},
		{CustomerID: 2, AddressDetails: "456 Second St, Chiang Mai", Latitude: 18.7883, Longitude: 98.9853, IsDefault: true},
	}
	for _, a := range addresses {
		DB.FirstOrCreate(&a, entity.Address{CustomerID: a.CustomerID, AddressDetails: a.AddressDetails})
	}


	// --- Mock ServiceType ---
	services := []entity.ServiceType{
		// 🧺 ถังซัก (Washer)
		{Type: "ถังซัก 10kg", Price: 50, Capacity: 10},
		{Type: "ถังซัก 14kg", Price: 70, Capacity: 14},
		{Type: "ถังซัก 18kg", Price: 90, Capacity: 18},
		{Type: "ถังซัก 28kg", Price: 120, Capacity: 28},

		// 🔥 ถังอบ (Dryer)
		{Type: "ถังอบ 14kg", Price: 50, Capacity: 14},
		{Type: "ถังอบ 25kg", Price: 70, Capacity: 25},
		{Type: "ไม่อบ", Price: 0, Capacity: 0},
	}

	for _, s := range services {
		DB.FirstOrCreate(&s, entity.ServiceType{Type: s.Type})
	}


	// --- Mock Detergent ---
	detergents := []entity.Detergent{
		{
			Name:  "น้ำยาซักเหลว",
			Type:  "Liquid",
			InStock: 100,
			// UserID: 1,
			CategoryID: 1,
		},
		{
			Name:  "ผงซักฟอก",
			Type:  "Powder",
			InStock: 50,
			// UserID: 1,
			CategoryID: 2,
		},
		{
			Name:  "น้ำยาซักสูตรพิเศษ",
			Type:  "Liquid",
			InStock: 30,
			// UserID: 2,
			UserID: 2,
			CategoryID: 1,
		},
		{
			Name:  "ผงซักฟอกสูตรเข้มข้น",
			Type:  "Powder",
			InStock: 20,
			// UserID: 2,
			CategoryID: 2,
		},
	}
	for _, d := range detergents {
		DB.FirstOrCreate(&d, entity.Detergent{Name: d.Name, Type: d.Type})
	}

	// --- Mock DetergentCategory ---
	categories := []entity.DetergentCategory{
		{Name: "น้ำยาซัก", Description: "สำหรับทำความสะอาดเสื้อผ้า"},
		{Name: "ปรับผ้านุ่ม", Description: "สำหรับทำให้ผ้านุ่มและมีกลิ่นหอม"},
	}

	for _, c := range categories {
		DB.FirstOrCreate(&c, entity.DetergentCategory{Name: c.Name})
	}

	// --- Mock Payments ---
	// payments := []entity.Payment{
	// 	{Bill: 1, PaymentType: "Credit Card", CreatedAtTime: "2025-08-20 10:00", CheckPayment: true, OrderID: 1, StatusPayment: "Paid", Price: 150, TotalAmount: 150},
	// 	{Bill: 2, PaymentType: "Cash", CreatedAtTime: "2025-08-21 14:00", CheckPayment: false, OrderID: 2, StatusPayment: "Unpaid", Price: 240, TotalAmount: 240},
	// }
	// for _, p := range payments {
	// 	DB.FirstOrCreate(&p, entity.Payment{Bill: p.Bill})
	// }

	// --- Mock LaundryProcess ---
	// processes := []entity.Process{
	// 	{Step: "Washing", StartTime: 9.00, EndTime: 10.00, OrderID: 1, ServiceID: 1, MachineID: 101},
	// 	{Step: "Drying", StartTime: 10.15, EndTime: 11.00, OrderID: 1, ServiceID: 1, MachineID: 202},
	// }
	// for _, lp := range processes {
	// 	DB.Create(&lp)
	// }
	fmt.Println("Mock data added successfully!")
}
