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
	ClothTypeName string `json:"ClothTypeName"`
	ServiceTypeID uint   `json:"ServiceTypeID"`
	Quantity      int    `json:"Quantity"`
}

type UpsertLaundryCheckInput struct {
	StaffNote string             `json:"StaffNote"`
	Items     []LaundryItemInput `json:"Items"`
}

type UpdateItemInput struct {
	ClothTypeName *string `json:"ClothTypeName,omitempty"`
	ServiceTypeID *uint   `json:"ServiceTypeID,omitempty"`
	Quantity      *int    `json:"Quantity,omitempty"`
}

type ServiceTypeMini struct {
	ID   uint   `json:"ID"`
	Name string `json:"Name"`
}

type OrderSummary struct {
	ID              uint              `json:"ID"`
	CreatedAt       time.Time         `json:"CreatedAt"`
	CustomerName    string            `json:"CustomerName"`
	Phone           string            `json:"Phone"`
	OrderNote       string            `json:"OrderNote"`
	HistoryCount    int               `json:"HistoryCount"`
	LatestHistoryAt *time.Time        `json:"LatestHistoryAt"`
	TotalItems      int               `json:"TotalItems"`
	TotalQuantity   int               `json:"TotalQuantity"`
	ServiceTypes    []ServiceTypeMini `json:"ServiceTypes"`
}

type OrderItemView struct {
	ID            uint   `json:"ID"`
	ClothTypeID   uint   `json:"ClothTypeID"`
	ClothTypeName string `json:"ClothTypeName"`
	ServiceTypeID uint   `json:"ServiceTypeID"`
	ServiceType   string `json:"ServiceType"`
	Quantity      int    `json:"Quantity"`
}

type OrderDetailView struct {
	ID            uint              `json:"ID"`
	CreatedAt     time.Time         `json:"CreatedAt"`
	CustomerID    uint              `json:"CustomerID"`
	CustomerName  string            `json:"CustomerName"`
	Phone         string            `json:"Phone"`
	AddressID     uint              `json:"AddressID"`
	Address       string            `json:"Address"`
	OrderNote     string            `json:"OrderNote"`
	StaffNote     string            `json:"StaffNote"`
	ServiceTypes  []ServiceTypeMini `json:"ServiceTypes"`
	Items         []OrderItemView   `json:"Items"`
	TotalItems    int               `json:"TotalItems"`
	TotalQuantity int               `json:"TotalQuantity"`
}

// ✅ HistoryEntry: Quantity = absolute ปัจจุบัน ณ ตอนเกิดเหตุการณ์
type HistoryEntry struct {
	ID              uint      `json:"ID"`
	RecordedAt      time.Time `json:"RecordedAt"`
	Quantity        int       `json:"Quantity"` // absolute
	Action          string    `json:"Action"`   // ADD | EDIT | DELETE
	ClothTypeID     *uint     `json:"ClothTypeID,omitempty"`
	ServiceTypeID   *uint     `json:"ServiceTypeID,omitempty"`
	ClothTypeName   string    `json:"ClothTypeName"`
	ServiceType     string    `json:"ServiceType"`
	SortedClothesID uint      `json:"SortedClothesID"`
	AfterQuantity   int       `json:"AfterQuantity"` // = Quantity (คงเหลือหลังเหตุการณ์)
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

	var order entity.Order
	if err := config.DB.Preload("Customer").First(&order, oid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"Error": "ไม่พบ Order"})
		return
	}

	var srec entity.SortingRecord
	if err := config.DB.Where("order_id = ?", order.ID).First(&srec).Error; err != nil {
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
		if strings.TrimSpace(input.StaffNote) != "" {
			srec.SortingNote = strings.TrimSpace(input.StaffNote)
			_ = config.DB.Save(&srec).Error
		}
	}

	serviceIDs := map[uint]struct{}{}

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
			ClothTypeID:     ct.ID,
			ServiceTypeID:   it.ServiceTypeID,
			SortingRecordID: srec.ID,
		}
		if err := config.DB.Create(&row).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"Error": "บันทึก SortedClothes ไม่สำเร็จ"})
			return
		}

		// snapshot + absolute
		ctID := row.ClothTypeID
		stID := row.ServiceTypeID
		h := entity.SortingHistory{
			HisQuantity:     row.SortedQuantity, // ✅ absolute
			RecordedAt:      time.Now(),
			SortedClothesID: row.ID,
			Action:          "ADD",
			ClothTypeID:     &ctID,
			ServiceTypeID:   &stID,
		}
		_ = config.DB.Create(&h).Error

		serviceIDs[it.ServiceTypeID] = struct{}{}
	}

	// ผูกบริการให้ order
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
	c.Header("Cache-Control", "no-store")
	c.JSON(http.StatusOK, ok{OrderID: order.ID})
}

// GET /laundry-check/orders
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
			config.DB.Model(&entity.SortedClothes{}).
				Where("sorting_record_id = ? AND sorted_quantity > 0", srec.ID).
				Count(&itemCount)
			config.DB.Model(&entity.SortedClothes{}).
				Where("sorting_record_id = ? AND sorted_quantity > 0", srec.ID).
				Select("COALESCE(SUM(sorted_quantity),0)").Scan(&qtySum)
		}

		if itemCount > 0 || qtySum > 0 {
			continue
		}

		name, phone := "", ""
		if o.Customer != nil {
			name = o.Customer.FirstName + " " + o.Customer.LastName
			phone = o.Customer.PhoneNumber
		}

		stOut := make([]ServiceTypeMini, 0)
		for _, st := range o.ServiceTypes {
			if st != nil {
				stOut = append(stOut, ServiceTypeMini{ID: st.ID, Name: st.Type})
			}
		}

		results = append(results, OrderSummary{
			ID:            o.ID,
			CreatedAt:     o.CreatedAt,
			CustomerName:  name,
			Phone:         phone,
			OrderNote:     o.OrderNote,
			TotalItems:    int(itemCount),
			TotalQuantity: int(qtySum),
			ServiceTypes:  stOut,
		})
	}

	c.Header("Cache-Control", "no-store")
	c.JSON(http.StatusOK, results)
}

// GET /laundry-check/orders/:id
func GetLaundryOrderDetail(c *gin.Context) {
	id := c.Param("id")

	var order entity.Order
	if err := config.DB.Preload("Customer").Preload("Address").Preload("ServiceTypes").First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"Error": "ไม่พบ Order"})
		return
	}

	var srec entity.SortingRecord
	_ = config.DB.Where("order_id = ?", order.ID).First(&srec).Error

	items := []OrderItemView{}
	if srec.ID != 0 {
		var rows []entity.SortedClothes
		if err := config.DB.Preload("ClothType").Preload("ServiceType").
			Where("sorting_record_id = ? AND sorted_quantity > 0", srec.ID).
			Find(&rows).Error; err == nil {
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

	staffNote := ""
	if srec.ID != 0 {
		staffNote = srec.SortingNote
	}

	stOut := make([]ServiceTypeMini, 0)
	for _, st := range order.ServiceTypes {
		if st != nil {
			stOut = append(stOut, ServiceTypeMini{ID: st.ID, Name: st.Type})
		}
	}
	if len(stOut) == 0 && srec.ID != 0 {
		type row struct{ ID uint; Name string }
		var rows []row
		config.DB.
			Table("service_types AS st").
			Select("DISTINCT st.id AS id, st.type AS name").
			Joins("JOIN sorted_clothes AS sc ON sc.service_type_id = st.id").
			Where("sc.sorting_record_id = ? AND sc.sorted_quantity > 0", srec.ID).
			Scan(&rows)
		for _, r := range rows {
			stOut = append(stOut, ServiceTypeMini{ID: r.ID, Name: r.Name})
		}
	}

	c.Header("Cache-Control", "no-store")
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
		ServiceTypes:  stOut,
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
	// ใช้ absolute ที่เก็บใน history เลย ไม่ต้องคำนวณ running sum
	config.DB.
		Table("sorting_histories AS h").
		Select(`
			h.id AS id,
			h.recorded_at AS recorded_at,
			h.his_quantity AS quantity,               -- absolute
			h.action AS action,
			h.sorted_clothes_id AS sorted_clothes_id,
			h.cloth_type_id AS cloth_type_id,
			h.service_type_id AS service_type_id,
			COALESCE(ct.type_name, '') AS cloth_type_name,
			COALESCE(st.type, '') AS service_type,
			h.his_quantity AS after_quantity          -- = absolute
		`).
		Joins("LEFT JOIN sorted_clothes AS sc ON sc.id = h.sorted_clothes_id").
		Joins("LEFT JOIN sorting_records AS sr ON sr.id = sc.sorting_record_id").
		Joins("LEFT JOIN cloth_types AS ct ON ct.id = h.cloth_type_id").
		Joins("LEFT JOIN service_types AS st ON st.id = h.service_type_id").
		Where("sr.order_id = ?", order.ID).
		Order("h.recorded_at ASC, h.id ASC").
		Scan(&entries)

	c.Header("Cache-Control", "no-store")
	c.JSON(http.StatusOK, entries)
}

// PUT /laundry-checks/:orderId/items/:itemId
func UpdateSortedClothes(c *gin.Context) {
	orderID, _ := strconv.ParseUint(c.Param("orderId"), 10, 64)
	itemID, _ := strconv.ParseUint(c.Param("itemId"), 10, 64)
	if orderID == 0 || itemID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"Error": "พารามิเตอร์ไม่ถูกต้อง"})
		return
	}

	var row entity.SortedClothes
	if err := config.DB.First(&row, itemID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"Error": "ไม่พบรายการผ้า"})
		return
	}

	var srec entity.SortingRecord
	if err := config.DB.First(&srec, row.SortingRecordID).Error; err != nil || uint(orderID) != srec.OrderID {
		c.JSON(http.StatusBadRequest, gin.H{"Error": "รายการไม่อยู่ในออเดอร์นี้"})
		return
	}

	var in UpdateItemInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"Error": err.Error()})
		return
	}

	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.First(&row, itemID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"Error": "ไม่พบรายการผ้า"})
		return
	}

	changed := false

	// อัปเดต cloth/service
	if in.ClothTypeName != nil {
		ct, err := getOrCreateClothTypeByName(*in.ClothTypeName)
		if err != nil || ct == nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"Error": "ประเภทผ้าไม่ถูกต้อง"})
			return
		}
		if row.ClothTypeID != ct.ID {
			row.ClothTypeID = ct.ID
			changed = true
		}
	}
	if in.ServiceTypeID != nil {
		var st entity.ServiceType
		if err := tx.First(&st, *in.ServiceTypeID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"Error": "ไม่พบ ServiceType"})
			return
		}
		if row.ServiceTypeID != *in.ServiceTypeID {
			row.ServiceTypeID = *in.ServiceTypeID
			changed = true
		}
		// ผูกกับ order ถ้ายังไม่ถูกผูก
		var order entity.Order
		if err := tx.First(&order, srec.OrderID).Error; err == nil {
			_ = tx.Model(&order).Association("ServiceTypes").Append(&st)
		}
	}

	// อัปเดตจำนวน: เก็บ history เป็น "absolute" เสมอ
	if in.Quantity != nil {
		if *in.Quantity < 0 {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"Error": "จำนวนต้องไม่เป็นค่าติดลบ"})
			return
		}
		if row.SortedQuantity != *in.Quantity {
			changed = true
			row.SortedQuantity = *in.Quantity
		}
	}

	// ถ้ามีการเปลี่ยนชนิด/บริการ หรือจำนวน ให้สร้างประวัติใหม่ (absolute)
	if changed {
		ctID := row.ClothTypeID
		stID := row.ServiceTypeID
		h := entity.SortingHistory{
			HisQuantity:     row.SortedQuantity, // ✅ absolute after update
			RecordedAt:      time.Now(),
			SortedClothesID: row.ID,
			Action:          "EDIT",
			ClothTypeID:     &ctID,
			ServiceTypeID:   &stID,
		}
		if err := tx.Create(&h).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"Error": "บันทึกประวัติไม่สำเร็จ"})
			return
		}
	} else {
		// ไม่มีอะไรเปลี่ยน
		tx.Rollback()
		c.JSON(http.StatusOK, gin.H{"Success": true, "Message": "ไม่มีการเปลี่ยนแปลง"})
		return
	}

	if err := tx.Save(&row).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "อัปเดตรายการไม่สำเร็จ"})
		return
	}
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "อัปเดตรายการไม่สำเร็จ"})
		return
	}

	// ส่ง item ปัจจุบันกลับ (ถ้าจะใช้)
	var updated entity.SortedClothes
	_ = config.DB.Preload("ClothType").Preload("ServiceType").First(&updated, row.ID).Error

	c.Header("Cache-Control", "no-store")
	c.JSON(http.StatusOK, gin.H{
		"Success": true,
		"Item": gin.H{
			"ID":            updated.ID,
			"ClothTypeID":   updated.ClothTypeID,
			"ClothTypeName": func() string { if updated.ClothType != nil { return updated.ClothType.TypeName } ; return "" }(),
			"ServiceTypeID": updated.ServiceTypeID,
			"ServiceType":   func() string { if updated.ServiceType != nil { return updated.ServiceType.Type } ; return "" }(),
			"Quantity":      updated.SortedQuantity,
		},
	})
}

// DELETE /laundry-checks/:orderId/items/:itemId  -> ตั้งจำนวน = 0 + เก็บ history absolute = 0
func DeleteSortedClothes(c *gin.Context) {
	orderID, _ := strconv.ParseUint(c.Param("orderId"), 10, 64)
	itemID, _ := strconv.ParseUint(c.Param("itemId"), 10, 64)
	if orderID == 0 || itemID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"Error": "พารามิเตอร์ไม่ถูกต้อง"})
		return
	}

	var row entity.SortedClothes
	if err := config.DB.First(&row, itemID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"Error": "ไม่พบรายการผ้า"})
		return
	}
	var srec entity.SortingRecord
	if err := config.DB.First(&srec, row.SortingRecordID).Error; err != nil || uint(orderID) != srec.OrderID {
		c.JSON(http.StatusBadRequest, gin.H{"Error": "รายการไม่อยู่ในออเดอร์นี้"})
		return
	}

	// บันทึกประวัติเป็น absolute = 0
	ctID := row.ClothTypeID
	stID := row.ServiceTypeID
	h := entity.SortingHistory{
		HisQuantity:     0, // ✅ หลังลบคงเหลือ 0
		RecordedAt:      time.Now(),
		SortedClothesID: row.ID,
		Action:          "DELETE",
		ClothTypeID:     &ctID,
		ServiceTypeID:   &stID,
	}
	_ = config.DB.Create(&h).Error

	row.SortedQuantity = 0
	if err := config.DB.Save(&row).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "ลบรายการไม่สำเร็จ"})
		return
	}

	c.Header("Cache-Control", "no-store")
	c.JSON(http.StatusOK, gin.H{"Success": true})
}

// ---------- Lookups ----------
func ListClothTypes(c *gin.Context) {
	var list []entity.ClothType
	if err := config.DB.Find(&list).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "ดึง ClothType ไม่สำเร็จ"})
		return
	}
	type V struct {
		ID   uint   `json:"ID"`
		Name string `json:"Name"`
	}
	out := make([]V, 0, len(list))
	for _, x := range list {
		out = append(out, V{ID: x.ID, Name: x.TypeName})
	}
	c.Header("Cache-Control", "no-store")
	c.JSON(http.StatusOK, out)
}

func ListServiceTypes(c *gin.Context) {
	var list []entity.ServiceType
	if err := config.DB.Find(&list).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "ดึง ServiceType ไม่สำเร็จ"})
		return
	}
	type V struct {
		ID   uint   `json:"ID"`
		Name string `json:"Name"`
	}
	out := make([]V, 0, len(list))
	for _, x := range list {
		out = append(out, V{ID: x.ID, Name: x.Type})
	}
	c.Header("Cache-Control", "no-store")
	c.JSON(http.StatusOK, out)
}

func GetLaundryCustomers(c *gin.Context) {
	var custs []entity.Customer
	if err := config.DB.Find(&custs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "ดึงลูกค้าไม่สำเร็จ"})
		return
	}
	type V struct {
		ID        uint   `json:"ID"`
		Name      string `json:"Name"`
		Phone     string `json:"Phone"`
		AddressID uint   `json:"AddressID"`
		Address   string `json:"Address"`
		Note      string `json:"Note"`
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
	c.Header("Cache-Control", "no-store")
	c.JSON(http.StatusOK, out)
}
