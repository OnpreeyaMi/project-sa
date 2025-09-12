package config

import (
	"context"
	"fmt"
	"log"
	"strings" // ✅ เพิ่มเข้ามา
	"time"

	"github.com/OnpreeyaMi/project-sa/entity"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

// ------------------------------
// Connect + Setup (เรียกจาก main)
// ------------------------------
func ConnectDatabase() {
	// ใช้ WAL + busy_timeout + foreign_keys
	dsn := "file:sa_laundry.db?_journal_mode=WAL&_busy_timeout=10000&_foreign_keys=on"
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("ไม่สามารถเชื่อมต่อฐานข้อมูลได้")
	}

	sqlDB, err := db.DB()
	if err != nil {
		panic("ได้ gorm.DB แต่ดึง *sql.DB ไม่ได้")
	}

	// สำคัญ: SQLite แนะนำ serialize writes
	sqlDB.SetMaxOpenConns(1)
	sqlDB.SetMaxIdleConns(1)

	// ย้ำ PRAGMA เผื่อ driver param ไม่ถูกใช้
	db.Exec("PRAGMA journal_mode=WAL;")
	db.Exec("PRAGMA foreign_keys=ON;")
	db.Exec("PRAGMA busy_timeout=10000;")

	DB = db
	fmt.Println("เชื่อมต่อ SQLite (WAL) สำเร็จ!")
}

func SetupDatabase() {
	// ---------- AutoMigrate ----------
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
		&entity.Promotion{},
		&entity.PromotionCondition{},
		&entity.PromotionUsage{},
		&entity.ComplaintAttachment{}, // เก็บไฟล์เพิ่มเติม
		&entity.Role{},
		&entity.DiscountType{},
		&entity.DetergentUsageHistory{},
	)
	if err != nil {
		fmt.Println("Error in AutoMigrate:", err)
	} else {
		fmt.Println("AutoMigrate completed successfully.")
	}

	// ---------- Index/Constraints ----------
	DB.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS uniq_cloth_types_type_name ON cloth_types(type_name);`)
	DB.Exec(`CREATE INDEX IF NOT EXISTS idx_sorted_clothes_deleted_at ON sorted_clothes(deleted_at);`)

	MockData()
}

// ------------------------------
// Utilities
// ------------------------------
func phash(p string) string {
	b, err := bcrypt.GenerateFromPassword([]byte(p), bcrypt.DefaultCost)
	if err != nil {
		panic(err)
	}
	return string(b)
}

// withBusyRetry: helper สำหรับ seed/mock ที่อาจชน lock
func withBusyRetry(ctx context.Context, tries int, fn func() error) error {
	delay := 120 * time.Millisecond
	for i := 0; i < tries; i++ {
		if err := fn(); err != nil {
			if containsBusy(fmt.Sprint(err)) {
				time.Sleep(delay)
				delay *= 2
				continue
			}
			return err
		}
		return nil
	}
	return fmt.Errorf("sqlite busy/locked after %d retries", tries)
}

// ✅ ทำให้เรียบง่าย: ใช้ strings.Contains + ToLower
func containsBusy(s string) bool {
	low := strings.ToLower(s)
	return strings.Contains(low, "database is locked") || strings.Contains(low, "busy")
}

// ------------------------------
// MockData (คงของเดิม)
// ------------------------------
func MockData() {
	// --- Roles ---
	roles := []entity.Role{{Name: "admin"}, {Name: "customer"}, {Name: "employee"}}
	for _, r := range roles {
		DB.FirstOrCreate(&r, entity.Role{Name: r.Name})
	}

	// --- Users (ensure bcrypt hash) ---
	users := []entity.User{
		{Email: "admin@example.com", Password: phash("1234"), RoleID: 1},
		{Email: "customer1@example.com", Password: phash("1234"), RoleID: 2},
		{Email: "customer2@example.com", Password: phash("1234"), RoleID: 2},
	}
	for _, u := range users {
		var exist entity.User
		if err := DB.Where("email = ?", u.Email).First(&exist).Error; err == nil {
			// อัปเกรดรหัสผ่านเดิมถ้ายังเป็น plain
			if len(exist.Password) > 0 && exist.Password[0] != '$' {
				exist.Password = phash(exist.Password)
				DB.Save(&exist)
			}
		} else if err != nil && err != gorm.ErrRecordNotFound {
			log.Println(err)
		} else {
			DB.Create(&u)
		}
	}

	// --- Customers ---
	customers := []entity.Customer{
		{FirstName: "Nuntawut", LastName: "K.", PhoneNumber: "0812345678", GenderID: 1, UserID: 2},
		{FirstName: "Alice", LastName: "B.", PhoneNumber: "0898765432", GenderID: 1, UserID: 3},
	}
	for _, c := range customers {
		DB.FirstOrCreate(&c, entity.Customer{PhoneNumber: c.PhoneNumber})
	}

	// Genders
	genders := []entity.Gender{{Name: "ชาย"}, {Name: "หญิง"}, {Name: "อืนๆ"}}
	for _, g := range genders {
		DB.FirstOrCreate(&g, entity.Gender{Name: g.Name})
	}

	// --- Addresses ---
	addresses := []entity.Address{
		{CustomerID: 1, AddressDetails: "123 Main St, Bangkok", Latitude: 13.7563, Longitude: 100.5018, IsDefault: true},
		{CustomerID: 2, AddressDetails: "456 Second St, Chiang Mai", Latitude: 18.7883, Longitude: 98.9853, IsDefault: true},
	}
	for _, a := range addresses {
		DB.FirstOrCreate(&a, entity.Address{CustomerID: a.CustomerID, AddressDetails: a.AddressDetails})
	}

	// --- Service Types ---
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

	// --- DetergentCategory ---
	categories := []entity.DetergentCategory{
		{Name: "น้ำยาซัก", Description: "สำหรับทำความสะอาดเสื้อผ้า"},
		{Name: "ปรับผ้านุ่ม", Description: "สำหรับทำให้ผ้านุ่มและมีกลิ่นหอม"},
	}
	for _, c := range categories {
		DB.FirstOrCreate(&c, entity.DetergentCategory{Name: c.Name})
	}

	// --- DiscountType ---
	discountTypes := []entity.DiscountType{
		{TypeName: "เปอร์เซ็นต์", Description: "ลดเป็นเปอร์เซ็นต์"},
		{TypeName: "จำนวนเงิน", Description: "ลดเป็นจำนวนเงิน"},
	}
	for _, dt := range discountTypes {
		DB.FirstOrCreate(&dt, entity.DiscountType{TypeName: dt.TypeName})
	}

	// --- Promotions ---
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

	// --- PromotionConditions ---
	conds := []entity.PromotionCondition{
		{ConditionType: "MinOrderAmount", Value: "300", PromotionID: 1},
		{ConditionType: "CustomerGroup", Value: "new", PromotionID: 2},
	}
	for _, c := range conds {
		DB.FirstOrCreate(&c, entity.PromotionCondition{PromotionID: c.PromotionID, ConditionType: c.ConditionType})
	}

	// --- LaundryProcess ---
	processes := []entity.LaundryProcess{
		{Status: "รอดำเนินการ"},
		{Status: "กำลังซัก"},
	}
	for _, lp := range processes {
		DB.FirstOrCreate(&lp, entity.LaundryProcess{Status: lp.Status})
	}

	// --- Machines ---
	machines := []entity.Machine{
		{Machine_type: "washing", Machine_number: 1, Capacity_kg: 7, Status: "available"},
		{Machine_type: "washing", Machine_number: 2, Capacity_kg: 10, Status: "available"},
		{Machine_type: "washing", Machine_number: 3, Capacity_kg: 8, Status: "available"},
		{Machine_type: "washing", Machine_number: 4, Capacity_kg: 12, Status: "available"},
		{Machine_type: "drying", Machine_number: 1, Capacity_kg: 7, Status: "available"},
		{Machine_type: "drying", Machine_number: 2, Capacity_kg: 10, Status: "available"},
		{Machine_type: "drying", Machine_number: 3, Capacity_kg: 12, Status: "available"},
	}
	for _, m := range machines {
		DB.FirstOrCreate(&m, entity.Machine{Machine_type: m.Machine_type, Capacity_kg: m.Capacity_kg, Status: m.Status})
	}

	// --- Positions ---
	positions := []entity.Position{
		{PositionName: "พนักงานซักผ้า"},
		{PositionName: "พนักงานขนส่งผ้า"},
	}
	for _, p := range positions {
		DB.FirstOrCreate(&p, entity.Position{PositionName: p.PositionName})
	}

	fmt.Println("✅ Mock data added successfully!")
}
