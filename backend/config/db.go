package config

import (
	"fmt"
	"github.com/OnpreeyaMi/project-sa/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"time"
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
	// AutoMigrate สำหรับทุก entity
	err := DB.AutoMigrate(
		&entity.Address{},
		&entity.ClothType{},
		&entity.Complaint{},
		&entity.Customer{},
		&entity.DetergentCategory{},
		&entity.Detergent{},
		&entity.Employee{},
		&entity.EmployeeStatus{},
		&entity.History{},
		&entity.HistoryComplain{},
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
		&entity.DetergentUsageHistory{},
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
	// --- Mock Role ---
	roles := []entity.Role{
		{Role_name: "admin"},
		{Role_name: "customer"},
	}
	for _, r := range roles {
		DB.FirstOrCreate(&r, entity.Role{Role_name: r.Role_name})
	}

	// --- Mock User ---
	users := []entity.User{
		{Email: "admin@example.com", Password: "hashedpassword", Status: "active", RoleID: 1},
		{Email: "customer1@example.com", Password: "hashedpassword", Status: "active", RoleID: 2},
		{Email: "customer2@example.com", Password: "hashedpassword", Status: "active", RoleID: 2},
	}
	for _, u := range users {
		DB.FirstOrCreate(&u, entity.User{Email: u.Email})
	}

	// --- Mock Gender ---
	genders := []entity.Gender{
		{Name: "ชาย"},
		{Name: "หญิง"},
		{Name: "อืนๆ"},
	}
	for _, g := range genders {
		DB.FirstOrCreate(&g, entity.Gender{Name: g.Name})
	}

	// --- Mock ServiceType ---
	services := []entity.ServiceType{
		{Type: "ซัก 10kg", Price: 50, Capacity: 10},
		{Type: "ซัก 14kg", Price: 70, Capacity: 14},
		{Type: "ซัก 18kg", Price: 90, Capacity: 18},
		{Type: "ซัก 28kg", Price: 120, Capacity: 28},
		{Type: "อบ 14kg", Price: 50, Capacity: 14},
		{Type: "อบ 25kg", Price: 70, Capacity: 25},
		{Type: "ไม่อบ", Price: 0, Capacity: 0},
	}
	for _, s := range services {
		DB.FirstOrCreate(&s, entity.ServiceType{Type: s.Type})
	}

	// --- Mock DetergentCategory ---
	categories := []entity.DetergentCategory{
		{Name: "น้ำยาซัก", Description: "สำหรับทำความสะอาดเสื้อผ้า"},
		{Name: "ปรับผ้านุ่ม", Description: "สำหรับทำให้ผ้านุ่มและมีกลิ่นหอม"},
	}

	for _, c := range categories {
		DB.FirstOrCreate(&c, entity.DetergentCategory{Name: c.Name})
	}

	// --- Mock Orders ---
	orders := []entity.Order{
		{CustomerID: 1, AddressID: 1, OrderNote: "Test order 1"},
		{CustomerID: 2, AddressID: 2, OrderNote: "Test order 2"},
	}
	for _, o := range orders {
		DB.FirstOrCreate(&o, entity.Order{CustomerID: o.CustomerID, AddressID: o.AddressID})
	}

	// --- Mock DiscountType ---
	discountTypes := []entity.DiscountType{
		{TypeName: "เปอร์เซ็นต์", Description: "ลดเป็นเปอร์เซ็นต์"},
		{TypeName: "จำนวนเงิน", Description: "ลดเป็นจำนวนเงิน"},
	}
	for _, dt := range discountTypes {
		DB.FirstOrCreate(&dt, entity.DiscountType{TypeName: dt.TypeName})
	}

	// --- Mock Promotion ---
	promotions := []entity.Promotion{
		{
			PromotionName:  "โปรลดหน้าฝน",
			Description:    "ลด 10% ทุกออเดอร์ช่วงหน้าฝน",
			DiscountValue:  10,
			StartDate:      time.Now().AddDate(0, 0, -5),
			EndDate:        time.Now().AddDate(0, 1, 0),
			Status:         "ใช้งาน",
			PromoImage:     "",
			DiscountTypeID: 1,
		},
		{
			PromotionName:  "ลด 50 บาท สำหรับลูกค้าใหม่",
			Description:    "ลูกค้าใหม่รับส่วนลด 50 บาท",
			DiscountValue:  50,
			StartDate:      time.Now().AddDate(0, 0, -10),
			EndDate:        time.Now().AddDate(0, 2, 0),
			Status:         "ใช้งาน",
			PromoImage:     "",
			DiscountTypeID: 2,
		},
	}
	for _, p := range promotions {
		DB.FirstOrCreate(&p, entity.Promotion{PromotionName: p.PromotionName})
	}

	// --- Mock PromotionCondition ---
	conds := []entity.PromotionCondition{
		{ConditionType: "MinOrderAmount", Value: "300", PromotionID: 1},
		{ConditionType: "CustomerGroup", Value: "new", PromotionID: 2},
	}
	for _, c := range conds {
		DB.FirstOrCreate(&c, entity.PromotionCondition{PromotionID: c.PromotionID, ConditionType: c.ConditionType})
	}
	
	// --- Mock Machines ---
	machines := []entity.Machine{
	{Machine_type: "washing", Machine_number: 1, Capacity_kg: 7, Status: "available"},
	{Machine_type: "washing", Machine_number: 2, Capacity_kg: 10, Status: "available"},
	{Machine_type: "washing", Machine_number: 3, Capacity_kg: 8, Status: "available"},
	{Machine_type: "washing", Machine_number: 4, Capacity_kg: 12, Status: "available"},
	{Machine_type: "drying",  Machine_number: 1, Capacity_kg: 7, Status: "available"},
	{Machine_type: "drying",  Machine_number: 2, Capacity_kg: 10, Status: "available"},
	{Machine_type: "drying",  Machine_number: 3, Capacity_kg: 12, Status: "available"},
	}
	for _, m := range machines {
	DB.FirstOrCreate(
		&m,
		entity.Machine{
			Machine_type: m.Machine_type,
			Capacity_kg:  m.Capacity_kg, 
		},
		)
	}
	// // --- Mock History ---
	// histories := []entity.OrderHistory{
	// 	{OrderID: 1, PaymentID: 1, ProcessID: 1},
	// 	{OrderID: 2, PaymentID: 2, ProcessID: 2},
	// }
	// for _, h := range histories {
	// 	DB.Create(&h)
	// }
	fmt.Println("✅ Mock data added successfully!")
}