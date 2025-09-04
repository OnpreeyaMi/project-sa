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
		&entity.Role{},
		&entity.Gender{},
		&entity.DiscountType{},
		&entity.Promotion{},
		&entity.PromotionCondition{},
		&entity.PromotionUsage{},
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
		{Type: "ซัก 10kg", Price: 50, Capacity: 10},
		{Type: "ซัก 14kg", Price: 70, Capacity: 14},
	}
	for _, s := range services {
		DB.FirstOrCreate(&s, entity.ServiceType{Type: s.Type})
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

	fmt.Println("✅ Mock data added successfully!")
}
