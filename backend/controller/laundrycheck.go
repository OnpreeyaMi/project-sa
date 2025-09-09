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

type UpdateSortedClothesInput struct {
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

type HistoryEntry struct {
	ID              uint      `json:"ID"`
	RecordedAt      time.Time `json:"RecordedAt"`
	Quantity        int       `json:"Quantity"`
	ClothTypeName   string    `json:"ClothTypeName"`
	ServiceType     string    `json:"ServiceType"`
	SortedClothesID uint      `json:"SortedClothesID"` // ใช้สำหรับ Edit/Delete
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

// POST /laundry-checks/:orderId  (Create หลายแถว)
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

	// หา/สร้าง SortingRecord สำหรับ order นี้
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

	// ผูกบริการกับออเดอร์ (many2many)
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

	c.JSON(http.StatusOK, gin.H{"OrderID": order.ID})
}

// PUT /laundry-checks/:orderId/items/:itemId  (Update)
func UpdateSortedClothes(c *gin.Context) {
	oidStr := c.Param("orderId")
	iidStr := c.Param("itemId")

	oid, _ := strconv.ParseUint(oidStr, 10, 64)
	iid, _ := strconv.ParseUint(iidStr, 10, 64)
	if oid == 0 || iid == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"Error": "รหัสไม่ถูกต้อง"})
		return
	}

	var order entity.Order
	if err := config.DB.First(&order, oid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"Error": "ไม่พบ Order"})
		return
	}

	var srec entity.SortingRecord
	if err := config.DB.Where("order_id = ?", order.ID).First(&srec).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"Error": "ยังไม่มีข้อมูลการแยกผ้า"})
		return
	}

	var inp UpdateSortedClothesInput
	if err := c.ShouldBindJSON(&inp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"Error": err.Error()})
		return
	}

	var row entity.SortedClothes
	if err := config.DB.Where("id = ? AND sorting_record_id = ?", iid, srec.ID).First(&row).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"Error": "ไม่พบรายการผ้า"})
		return
	}

	if inp.ClothTypeName != nil {
		ct, err := getOrCreateClothTypeByName(strings.TrimSpace(*inp.ClothTypeName))
		if err != nil || ct == nil {
			c.JSON(http.StatusBadRequest, gin.H{"Error": "ประเภทผ้าไม่ถูกต้อง"})
			return
		}
		row.ClothTypeID = ct.ID
	}
	if inp.ServiceTypeID != nil {
		var st entity.ServiceType
		if err := config.DB.First(&st, *inp.ServiceTypeID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"Error": "ไม่พบ ServiceType"})
			return
		}
		row.ServiceTypeID = *inp.ServiceTypeID
		_ = config.DB.Model(&order).Association("ServiceTypes").Append(&st)
	}
	if inp.Quantity != nil {
		if *inp.Quantity < 1 {
			c.JSON(http.StatusBadRequest, gin.H{"Error": "จำนวนต้องมากกว่า 0"})
			return
		}
		row.SortedQuantity = *inp.Quantity
	}

	if err := config.DB.Save(&row).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "บันทึกการแก้ไขไม่สำเร็จ"})
		return
	}

	// sync ประวัติ ล่าสุดของแถวนี้ให้แสดงจำนวนใหม่
	var h entity.SortingHistory
	if err := config.DB.Where("sorted_clothes_id = ?", row.ID).
		Order("recorded_at DESC, id DESC").
		First(&h).Error; err == nil {
		h.HisQuantity = row.SortedQuantity
		_ = config.DB.Save(&h).Error
	}

	c.JSON(http.StatusOK, gin.H{"OK": true})
}

// DELETE /laundry-checks/:orderId/items/:itemId  (Delete)
func DeleteSortedClothes(c *gin.Context) {
	oidStr := c.Param("orderId")
	iidStr := c.Param("itemId")

	oid, _ := strconv.ParseUint(oidStr, 10, 64)
	iid, _ := strconv.ParseUint(iidStr, 10, 64)
	if oid == 0 || iid == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"Error": "รหัสไม่ถูกต้อง"})
		return
	}

	var order entity.Order
	if err := config.DB.First(&order, oid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"Error": "ไม่พบ Order"})
		return
	}

	var srec entity.SortingRecord
	if err := config.DB.Where("order_id = ?", order.ID).First(&srec).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"Error": "ยังไม่มีข้อมูลการแยกผ้า"})
		return
	}

	var row entity.SortedClothes
	if err := config.DB.Where("id = ? AND sorting_record_id = ?", iid, srec.ID).First(&row).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"Error": "ไม่พบรายการผ้า"})
		return
	}

	_ = config.DB.Where("sorted_clothes_id = ?", row.ID).Delete(&entity.SortingHistory{}).Error
	if err := config.DB.Delete(&row).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "ลบไม่สำเร็จ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"OK": true})
}

// GET /laundry-check/orders?unprocessed=1  (Summary)
func ListLaundryOrders(c *gin.Context) {
	unprocessedOnly := strings.EqualFold(c.Query("unprocessed"), "1") || strings.EqualFold(c.Query("unprocessed"), "true")

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
			config.DB.Model(&entity.SortedClothes{}).Where("sorting_record_id = ?", srec.ID).
				Select("COALESCE(SUM(sorted_quantity),0)").Scan(&qtySum)
		}

		// เฉพาะที่ยังไม่เคยบันทึก
		if unprocessedOnly && (srec.ID != 0 && itemCount > 0) {
			continue
		}

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

		stOut := make([]ServiceTypeMini, 0)
		for _, st := range o.ServiceTypes {
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

// GET /laundry-check/orders/:id  (Detail)
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
		ServiceTypes:  stOut,
		Items:         items,
		TotalItems:    totalItems,
		TotalQuantity: totalQty,
	}

	c.JSON(http.StatusOK, resp)
}

// GET /laundry-check/orders/:id/history  (Read history + item id)
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
			COALESCE(st.type, '') AS service_type,
			sc.id AS sorted_clothes_id
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
		ID   uint   `json:"ID"`
		Name string `json:"Name"`
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
		ID   uint   `json:"ID"`
		Name string `json:"Name"`
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
	c.JSON(http.StatusOK, out)
}
