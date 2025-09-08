package controller

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/gin-gonic/gin"
)

// ===================== DTO =====================
type LaundryItemInput struct {
	ClothTypeName string
	ServiceTypeID uint
	Quantity      int
}

type UpsertLaundryCheckInput struct {
	StaffNote string
	Items     []LaundryItemInput
}

type ServiceTypeMini struct {
	ID   uint
	Name string
}

type OrderSummary struct {
	ID              uint
	CreatedAt       time.Time
	CustomerName    string
	Phone           string
	OrderNote       string
	HistoryCount    int
	LatestHistoryAt *time.Time
	TotalItems      int
	TotalQuantity   int
	// (ถ้าต้องการโชว์บริการในตารางรายการออเดอร์ด้วย ให้เปิดใช้ field นี้ฝั่ง FE)
	ServiceTypes []ServiceTypeMini
}

type OrderItemView struct {
	ID            uint
	ClothTypeID   uint
	ClothTypeName string
	ServiceTypeID uint
	ServiceType   string
	Quantity      int
}

type OrderDetailView struct {
	ID            uint
	CreatedAt     time.Time
	CustomerID    uint
	CustomerName  string
	Phone         string
	AddressID     uint
	Address       string
	OrderNote     string // หมายเหตุลูกค้า (มาจาก orders.order_note)
	StaffNote     string // หมายเหตุพนักงาน (มาจาก sorting_records.sorting_note)
	// ✅ เพิ่ม: รายการบริการของออเดอร์ เพื่อให้พนักงานรู้ว่าต้องทำอะไร
	ServiceTypes []ServiceTypeMini
	Items        []OrderItemView
	TotalItems   int
	TotalQuantity int
}

// ประวัติแต่ละรายการ
type HistoryEntry struct {
	ID            uint      `json:"ID"`
	RecordedAt    time.Time `json:"RecordedAt"`
	Quantity      int       `json:"Quantity"`
	ClothTypeName string    `json:"ClothTypeName"`
	ServiceType   string    `json:"ServiceType"`
}

// ===================== Helpers =====================
func findDefaultAddressText(cust *entity.Customer) (addrID uint, addrText string) {
	var addr entity.Address
	if err := config.DB.Where("customer_id = ? AND is_default = ?", cust.ID, true).First(&addr).Error; err == nil {
		return addr.ID, addr.AddressDetails
	}
	if err := config.DB.Where("customer_id = ?", cust.ID).First(&addr).Error; err == nil {
		return addr.ID, addr.AddressDetails
	}
	return 0, ""
}

func getOrCreateClothTypeByName(name string) (*entity.ClothType, error) {
	n := strings.TrimSpace(name)
	if n == "" {
		return nil, nil
	}
	var ct entity.ClothType
	err := config.DB.FirstOrCreate(&ct, entity.ClothType{TypeName: n}).Error
	if err != nil {
		return nil, err
	}
	return &ct, nil
}

// ===================== Endpoints =====================

// POST /laundry-checks/:orderId
// ไม่แก้ไขตาราง orders — ใช้ orderId อ้างอิง แล้วสร้าง/เพิ่มรายการผ้าเข้า SortedClothes (และประวัติ)
func UpsertLaundryCheck(c *gin.Context) {
	oidStr := c.Param("orderId")
	oid, _ := strconv.ParseUint(oidStr, 10, 64)
	if oid == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"Error": "orderId ไม่ถูกต้อง"})
		return
	}

	var input UpsertLaundryCheckInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"Error": err.Error()})
		return
	}
	if len(input.Items) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"Error": "ต้องมีรายการผ้าอย่างน้อย 1 รายการ"})
		return
	}

	// ตรวจสอบ order (อ่านอย่างเดียว)
	var order entity.Order
	if err := config.DB.Preload("Customer").First(&order, oid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"Error": "ไม่พบ Order"})
		return
	}

	// หา/สร้าง SortingRecord สำหรับ order นี้ (ไว้เก็บ StaffNote)
	var srec entity.SortingRecord
	if err := config.DB.Where("order_id = ?", order.ID).First(&srec).Error; err != nil {
		// ยังไม่มี ก็สร้างใหม่
		srec = entity.SortingRecord{
			SortingDate: time.Now(),
			SortingNote: strings.TrimSpace(input.StaffNote),
			OrderID:     order.ID,
		}
		if err := config.DB.Create(&srec).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"Error": "บันทึก SortingRecord ไม่สำเร็จ"})
			return
		}
	} else {
		// มีอยู่แล้ว อัปเดตหมายเหตุถ้าส่งมา
		if strings.TrimSpace(input.StaffNote) != "" {
			srec.SortingNote = strings.TrimSpace(input.StaffNote)
			_ = config.DB.Save(&srec).Error
		}
	}

	// นับยอดเดิมจาก SortedClothes ตาม SortingRecordID
	var oldTotal int64
	config.DB.Model(&entity.SortedClothes{}).
		Where("sorting_record_id = ?", srec.ID).
		Select("COALESCE(SUM(sorted_quantity),0)").
		Scan(&oldTotal)

	addTotal := 0
	for _, it := range input.Items {
		addTotal += it.Quantity
	}
	newTotal := int(oldTotal) + addTotal

	serviceIDs := map[uint]struct{}{}

	// เพิ่มรายการใหม่ + ประวัติ
	for _, it := range input.Items {
		ct, err := getOrCreateClothTypeByName(it.ClothTypeName)
		if err != nil || ct == nil {
			c.JSON(http.StatusBadRequest, gin.H{"Error": "ประเภทผ้าไม่ถูกต้อง"})
			return
		}
		var st entity.ServiceType
		if err := config.DB.First(&st, it.ServiceTypeID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"Error": "ไม่พบ ServiceType"})
			return
		}

		row := entity.SortedClothes{
			SortedQuantity:  it.Quantity,
			SortedCount:     newTotal,
			ClothTypeID:     ct.ID,
			ServiceTypeID:   it.ServiceTypeID,
			SortingRecordID: srec.ID,
		}
		if err := config.DB.Create(&row).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"Error": "บันทึก SortedClothes ไม่สำเร็จ"})
			return
		}

		h := entity.SortingHistory{
			HisQuantity:     it.Quantity,
			RecordedAt:      time.Now(),
			SortedClothesID: row.ID,
		}
		if err := config.DB.Create(&h).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"Error": "บันทึกประวัติ (SortingHistory) ไม่สำเร็จ"})
			return
		}

		serviceIDs[it.ServiceTypeID] = struct{}{}
	}

	// ผูก service types (many2many) กับ order — ไม่แก้ข้อมูลในตาราง orders เอง
	if len(serviceIDs) > 0 {
		ids := make([]uint, 0, len(serviceIDs))
		for id := range serviceIDs {
			ids = append(ids, id)
		}
		var svs []entity.ServiceType
		if err := config.DB.Where("id IN ?", ids).Find(&svs).Error; err == nil && len(svs) > 0 {
			for i := range svs {
				_ = config.DB.Model(&order).Association("ServiceTypes").Append(&svs[i])
			}
		}
	}

	type ok struct{ OrderID uint }
	c.JSON(http.StatusOK, ok{OrderID: order.ID})
}

// GET /laundry-check/orders : รายการออเดอร์ (สรุป)
func ListLaundryOrders(c *gin.Context) {
	var orders []entity.Order
	if err := config.DB.Preload("Customer").Preload("ServiceTypes").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "ดึงออเดอร์ไม่สำเร็จ"})
		return
	}

	results := make([]OrderSummary, 0, len(orders))
	for _, o := range orders {
		var srec entity.SortingRecord
		_ = config.DB.Where("order_id = ?", o.ID).First(&srec).Error

		var itemCount int64
		var qtySum int64
		if srec.ID != 0 {
			config.DB.Model(&entity.SortedClothes{}).Where("sorting_record_id = ?", srec.ID).Count(&itemCount)
			config.DB.Model(&entity.SortedClothes{}).Where("sorting_record_id = ?", srec.ID).Select("COALESCE(SUM(sorted_quantity),0)").Scan(&qtySum)
		}

		// นับประวัติทั้งหมดและหาวันที่ล่าสุด
		var histCount int64
		var latest time.Time
		if srec.ID != 0 {
			config.DB.
				Table("sorting_histories AS h").
				Joins("JOIN sorted_clothes AS sc ON sc.id = h.sorted_clothes_id").
				Where("sc.sorting_record_id = ?", srec.ID).
				Count(&histCount)

			config.DB.
				Table("sorting_histories AS h").
				Joins("JOIN sorted_clothes AS sc ON sc.id = h.sorted_clothes_id").
				Where("sc.sorting_record_id = ?", srec.ID).
				Select("MAX(h.recorded_at)").Scan(&latest)
		}

		name, phone := "", ""
		if o.Customer != nil {
			name = o.Customer.FirstName + " " + o.Customer.LastName
			phone = o.Customer.PhoneNumber
		}

		// รวม ServiceTypes (จาก many2many) เป็น slice {ID, Name}
		stOut := make([]ServiceTypeMini, 0)
		for _, st := range o.ServiceTypes {
			if st != nil {
				stOut = append(stOut, ServiceTypeMini{ID: st.ID, Name: st.Type})
			}
		}
		// fallback: ถ้า many2many ยังว่าง ให้ดึง DISTINCT จาก SortedClothes -> ServiceType
		if len(stOut) == 0 && srec.ID != 0 {
			type row struct{ ID uint; Name string }
			var rows []row
			config.DB.
				Table("service_types AS st").
				Select("DISTINCT st.id AS id, st.type AS name").
				Joins("JOIN sorted_clothes AS sc ON sc.service_type_id = st.id").
				Where("sc.sorting_record_id = ?", srec.ID).
				Scan(&rows)
			for _, r := range rows {
				stOut = append(stOut, ServiceTypeMini{ID: r.ID, Name: r.Name})
			}
		}

		var latestPtr *time.Time
		if !latest.IsZero() {
			latestPtr = &latest
		}

		results = append(results, OrderSummary{
			ID:              o.ID,
			CreatedAt:       o.CreatedAt,
			CustomerName:    name,
			Phone:           phone,
			OrderNote:       o.OrderNote,
			HistoryCount:    int(histCount),
			LatestHistoryAt: latestPtr,
			TotalItems:      int(itemCount),
			TotalQuantity:   int(qtySum),
			ServiceTypes:    stOut,
		})
	}

	c.JSON(http.StatusOK, results)
}

// GET /laundry-check/orders/:id : รายละเอียดออเดอร์ (✅ ดึง ServiceTypes มาด้วย)
func GetLaundryOrderDetail(c *gin.Context) {
	id := c.Param("id")

	var order entity.Order
	if err := config.DB.Preload("Customer").Preload("Address").Preload("ServiceTypes").First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"Error": "ไม่พบ Order"})
		return
	}

	// ดึงรายการผ้าจาก SortingRecord นี้
	var srec entity.SortingRecord
	_ = config.DB.Where("order_id = ?", order.ID).First(&srec).Error

	items := []OrderItemView{}
	if srec.ID != 0 {
		var rows []entity.SortedClothes
		if err := config.DB.Preload("ClothType").Preload("ServiceType").
			Where("sorting_record_id = ?", srec.ID).Find(&rows).Error; err == nil {
			for _, r := range rows {
				items = append(items, OrderItemView{
					ID:            r.ID,
					ClothTypeID:   r.ClothTypeID,
					ClothTypeName: func() string { if r.ClothType != nil { return r.ClothType.TypeName } ; return "" }(),
					ServiceTypeID: r.ServiceTypeID,
					ServiceType:   func() string { if r.ServiceType != nil { return r.ServiceType.Type } ; return "" }(),
					Quantity:      r.SortedQuantity,
				})
			}
		}
	}

	totalItems := len(items)
	totalQty := 0
	for _, it := range items {
		totalQty += it.Quantity
	}

	addrText := ""
	if order.Address != nil {
		addrText = order.Address.AddressDetails
	}
	name, phone := "", ""
	if order.Customer != nil {
		name = order.Customer.FirstName + " " + order.Customer.LastName
		phone = order.Customer.PhoneNumber
	}

	// StaffNote จาก SortingRecord ของออเดอร์นี้ (ถ้ามี)
	staffNote := ""
	if srec.ID != 0 {
		staffNote = srec.SortingNote
	}

	// ✅ รวบรวม ServiceTypes สำหรับ Order Detail
	stOut := make([]ServiceTypeMini, 0)
	for _, st := range order.ServiceTypes {
		if st != nil {
			stOut = append(stOut, ServiceTypeMini{ID: st.ID, Name: st.Type})
		}
	}
	// fallback: หาก many2many ว่าง ให้ดึงจากรายการผ้า (SortedClothes) แทน
	if len(stOut) == 0 && srec.ID != 0 {
		type row struct{ ID uint; Name string }
		var rows []row
		config.DB.
			Table("service_types AS st").
			Select("DISTINCT st.id AS id, st.type AS name").
			Joins("JOIN sorted_clothes AS sc ON sc.service_type_id = st.id").
			Where("sc.sorting_record_id = ?", srec.ID).
			Scan(&rows)
		for _, r := range rows {
			stOut = append(stOut, ServiceTypeMini{ID: r.ID, Name: r.Name})
		}
	}

	resp := OrderDetailView{
		ID:            order.ID,
		CreatedAt:     order.CreatedAt,
		CustomerID:    order.CustomerID,
		CustomerName:  name,
		Phone:         phone,
		AddressID:     order.AddressID,
		Address:       addrText,
		OrderNote:     order.OrderNote,
		StaffNote:     staffNote,
		ServiceTypes:  stOut,         // ✅ แนบไปด้วย
		Items:         items,
		TotalItems:    totalItems,
		TotalQuantity: totalQty,
	}

	c.JSON(http.StatusOK, resp)
}

// GET /laundry-check/orders/:id/history
func GetOrderHistory(c *gin.Context) {
	id := c.Param("id")

	var order entity.Order
	if err := config.DB.First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"Error": "ไม่พบ Order"})
		return
	}

	entries := []HistoryEntry{}
	config.DB.
		Table("sorting_histories AS h").
		Select(`
			h.id AS id,
			h.recorded_at AS recorded_at,
			h.his_quantity AS quantity,
			COALESCE(ct.type_name, '') AS cloth_type_name,
			COALESCE(st.type, '') AS service_type
		`).
		Joins("JOIN sorted_clothes AS sc ON sc.id = h.sorted_clothes_id").
		Joins("LEFT JOIN cloth_types AS ct ON ct.id = sc.cloth_type_id").
		Joins("LEFT JOIN service_types AS st ON st.id = sc.service_type_id").
		Joins("LEFT JOIN sorting_records AS sr ON sr.id = sc.sorting_record_id").
		Where("sr.order_id = ?", order.ID).
		Order("h.recorded_at ASC").
		Scan(&entries)

	c.JSON(http.StatusOK, entries)
}

// GET /clothtypes
func ListClothTypes(c *gin.Context) {
	var list []entity.ClothType
	if err := config.DB.Find(&list).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "ดึง ClothType ไม่สำเร็จ"})
		return
	}
	type V struct {
		ID   uint
		Name string
	}
	out := make([]V, 0, len(list))
	for _, x := range list {
		out = append(out, V{ID: x.ID, Name: x.TypeName})
	}
	c.JSON(http.StatusOK, out)
}

// GET /servicetypes
func ListServiceTypes(c *gin.Context) {
	var list []entity.ServiceType
	if err := config.DB.Find(&list).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "ดึง ServiceType ไม่สำเร็จ"})
		return
	}
	type V struct {
		ID   uint
		Name string
	}
	out := make([]V, 0, len(list))
	for _, x := range list {
		out = append(out, V{ID: x.ID, Name: x.Type})
	}
	c.JSON(http.StatusOK, out)
}

// GET /laundry-check/customers
func GetLaundryCustomers(c *gin.Context) {
	var custs []entity.Customer
	if err := config.DB.Find(&custs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "ดึงลูกค้าไม่สำเร็จ"})
		return
	}
	type V struct {
		ID        uint
		Name      string
		Phone     string
		AddressID uint
		Address   string
		Note      string
	}
	out := make([]V, 0, len(custs))
	for i := range custs {
		aID, aText := findDefaultAddressText(&custs[i])
		out = append(out, V{
			ID:        custs[i].ID,
			Name:      custs[i].FirstName + " " + custs[i].LastName,
			Phone:     custs[i].PhoneNumber,
			AddressID: aID,
			Address:   aText,
			Note:      "",
		})
	}
	c.JSON(http.StatusOK, out)
}
