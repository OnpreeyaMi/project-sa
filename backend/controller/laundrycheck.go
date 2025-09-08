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

// GET /laundry-check/orders : รายการออเดอร์ (สรุป)
func ListLaundryOrders(c *gin.Context) {
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
			config.DB.Model(&entity.SortedClothes{}).Where("sorting_record_id = ?", srec.ID).Select("COALESCE(SUM(sorted_quantity),0)").Scan(&qtySum)
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

// GET /laundry-check/customers : shape สำหรับหน้า LaundryCheck โดยเฉพาะ
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
