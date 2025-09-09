package controller

import (
	"net/http"
	"time"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/gin-gonic/gin"
)

// ===================== DTO =====================
// ใช้ชื่อฟิลด์ PascalCase และไม่ใช้ json tag
type LaundryItemInput struct {
	ClothTypeID   uint
	ServiceTypeID uint
	Quantity      int
}

type CreateLaundryCheckInput struct {
	CustomerID uint
	AddressID  uint
	StaffNote  string
	Items      []LaundryItemInput
}

type OrderSummary struct {
	ID            uint
	CreatedAt     time.Time
	CustomerName  string
	Phone         string
	TotalItems    int
	TotalQuantity int
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
	ID            uint
	CreatedAt     time.Time
	CustomerID    uint
	CustomerName  string
	Phone         string
	AddressID     uint
	Address       string
	StaffNote     string
	Items         []OrderItemView
	TotalItems    int
	TotalQuantity int
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

// ===================== Endpoints =====================

// POST /laundry-checks : สร้างออเดอร์ + SortingRecord + SortedClothes
func CreateLaundryCheck(c *gin.Context) {
	var input CreateLaundryCheckInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"Error": err.Error()})
		return
	}

	// validate customer & address
	var cust entity.Customer
	if err := config.DB.First(&cust, input.CustomerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"Error": "ไม่พบลูกค้า"})
		return
	}
	var addr entity.Address
	if err := config.DB.First(&addr, input.AddressID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"Error": "ไม่พบที่อยู่"})
		return
	}

	// create order
	order := entity.Order{
		CustomerID: cust.ID,
		AddressID:  addr.ID,
		OrderNote:  input.StaffNote,
	}
	if err := config.DB.Create(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "บันทึก Order ไม่สำเร็จ"})
		return
	}

	// create sorting record
	srec := entity.SortingRecord{
		SortingDate: time.Now(),
		SortingNote: input.StaffNote,
		OrderID:     order.ID,
	}
	if err := config.DB.Create(&srec).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "บันทึก SortingRecord ไม่สำเร็จ"})
		return
	}

	// sum total quantity for SortedCount
	totalQty := 0
	for _, it := range input.Items {
		totalQty += it.Quantity
	}

	// create rows for each item
	serviceIDs := map[uint]struct{}{}
	for _, it := range input.Items {
		// validate refs (เช็คว่ามีจริง)
		var ct entity.ClothType
		if err := config.DB.First(&ct, it.ClothTypeID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"Error": "ไม่พบ ClothType"})
			return
		}
		var st entity.ServiceType
		if err := config.DB.First(&st, it.ServiceTypeID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"Error": "ไม่พบ ServiceType"})
			return
		}

		row := entity.SortedClothes{
			SortedQuantity:  it.Quantity,
			SortedCount:     totalQty,
			ClothTypeID:     it.ClothTypeID,
			ServiceTypeID:   it.ServiceTypeID,
			SortingRecordID: srec.ID,
		}
		if err := config.DB.Create(&row).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"Error": "บันทึก SortedClothes ไม่สำเร็จ"})
			return
		}
		serviceIDs[it.ServiceTypeID] = struct{}{}
	}

	// bind service types (many2many) ที่ระดับ Order — แก้ให้ Append ทีละตัว
	if len(serviceIDs) > 0 {
		ids := make([]uint, 0, len(serviceIDs))
		for id := range serviceIDs {
			ids = append(ids, id)
		}
		var svs []entity.ServiceType
		if err := config.DB.Where("id IN ?", ids).Find(&svs).Error; err == nil && len(svs) > 0 {
			for i := range svs {
				if err := config.DB.Model(&order).Association("ServiceTypes").Append(&svs[i]); err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"Error": "ผูก ServiceTypes ไม่สำเร็จ"})
					return
				}
			}
		}
	}

	// ตอบกลับด้วย struct (PascalCase)
	type created struct{ OrderID uint }
	c.JSON(http.StatusCreated, created{OrderID: order.ID})
}

// POST /laundry-checks/:id/items : เพิ่มรายการผ้าเข้าออเดอร์เดิม
func AddLaundryItems(c *gin.Context) {
	id := c.Param("id")

	var order entity.Order
	if err := config.DB.First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"Error": "ไม่พบ Order"})
		return
	}

	var srec entity.SortingRecord
	if err := config.DB.Where("order_id = ?", order.ID).First(&srec).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"Error": "ไม่พบ SortingRecord ของออเดอร์นี้"})
		return
	}

	var items []LaundryItemInput
	if err := c.ShouldBindJSON(&items); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"Error": err.Error()})
		return
	}

	// old total
	var oldTotal int64
	config.DB.Model(&entity.SortedClothes{}).
		Where("sorting_record_id = ?", srec.ID).
		Select("COALESCE(SUM(sorted_quantity),0)").
		Scan(&oldTotal)

	addTotal := 0
	for _, it := range items {
		addTotal += it.Quantity
	}
	newTotal := int(oldTotal) + addTotal

	for _, it := range items {
		row := entity.SortedClothes{
			SortedQuantity:  it.Quantity,
			SortedCount:     newTotal,
			ClothTypeID:     it.ClothTypeID,
			ServiceTypeID:   it.ServiceTypeID,
			SortingRecordID: srec.ID,
		}
		if err := config.DB.Create(&row).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"Error": "เพิ่มรายการล้มเหลว"})
			return
		}
	}

	type ok struct {
		Message       string
		TotalQuantity int
	}
	c.JSON(http.StatusOK, ok{Message: "เพิ่มรายการสำเร็จ", TotalQuantity: newTotal})
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
	if err := config.DB.Preload("Customer").Find(&orders).Error; err != nil {
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

		name, phone := "", ""
		if o.Customer != nil {
			name = o.Customer.FirstName + " " + o.Customer.LastName
			phone = o.Customer.PhoneNumber
		}

		results = append(results, OrderSummary{
			ID:            o.ID,
			CreatedAt:     o.CreatedAt,
			CustomerName:  name,
			Phone:         phone,
			TotalItems:    int(itemCount),
			TotalQuantity: int(qtySum),
		})
	}

	c.JSON(http.StatusOK, results)
}

// GET /laundry-check/orders/:id : รายละเอียดออเดอร์
func GetLaundryOrderDetail(c *gin.Context) {
	id := c.Param("id")

	var order entity.Order
	if err := config.DB.Preload("Customer").Preload("Address").First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"Error": "ไม่พบ Order"})
		return
	}

	var srec entity.SortingRecord
	_ = config.DB.Where("order_id = ?", order.ID).First(&srec).Error

	items := []OrderItemView{}
	if srec.ID != 0 {
		var rows []entity.SortedClothes
		if err := config.DB.Preload("ClothType").Preload("ServiceType").Where("sorting_record_id = ?", srec.ID).Find(&rows).Error; err == nil {
			for _, r := range rows {
				items = append(items, OrderItemView{
					ID:            r.ID,
					ClothTypeID:   r.ClothTypeID,
					ClothTypeName: func() string { if r.ClothType != nil { return r.ClothType.TypeName }; return "" }(),
					ServiceTypeID: r.ServiceTypeID,
					ServiceType:   func() string { if r.ServiceType != nil { return r.ServiceType.Type }; return "" }(),
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

	resp := OrderDetailView{
		ID:            order.ID,
		CreatedAt:     order.CreatedAt,
		CustomerID:    order.CustomerID,
		CustomerName:  name,
		Phone:         phone,
		AddressID:     order.AddressID,
		Address:       addrText,
		StaffNote:     order.OrderNote,
		Items:         items,
		TotalItems:    totalItems,
		TotalQuantity: totalQty,
	}

	c.JSON(http.StatusOK, resp)
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

// GET /laundry-check/customers : shape สำหรับหน้า LaundryCheck โดยเฉพาะ
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
