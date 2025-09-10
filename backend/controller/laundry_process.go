package controller

import (
	"net/http"
	"time"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/gin-gonic/gin"
)

// สร้างกระบวนการซักใหม่ (default = รอดำเนินการ)
func CreateLaundryProcess(c *gin.Context) {
	var req struct {
		OrderID     uint   `json:"order_id"`
		EmployeeID  uint   `json:"employee_id"`
		Description string `json:"description"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Default status = "รอดำเนินการ"
	process := entity.LaundryProcess{
		Status:      "รอดำเนินการ",
		Start_time:  time.Now(),
		Description: req.Description,
		EmployeeID:  req.EmployeeID,
	}

	// เชื่อมกับ Order (ใช้ GORM Association หลังสร้าง process)
	var order entity.Order
	if err := config.DB.First(&order, req.OrderID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบ Order"})
		return
	}

	if err := config.DB.Create(&process).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// เชื่อม many2many LaundryProcess <-> Order
	if err := config.DB.Model(&process).Association("Order").Append(&order); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เชื่อม Order กับ LaundryProcess ไม่สำเร็จ: " + err.Error()})
		return
	}

	// สร้าง pickup queue อัตโนมัติเมื่อสร้าง LaundryProcess (status = 'รอดำเนินการ')
	pickupQueue := entity.Queue{
		Queue_type: "pickup",
		Status:     "waiting",
		OrderID:    order.ID,
	}
	if err := config.DB.Create(&pickupQueue).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "สร้าง pickup queue ไม่สำเร็จ: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, process)
}

// ดึง order by id
func GetOrderByID(c *gin.Context) {
	id := c.Param("id")
	var order entity.Order
	if err := config.DB.Preload("Customer").
		Preload("Address").
		Preload("LaundryProcesses.Machines").
		First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบ Order"})
		return
	}
	c.JSON(http.StatusOK, order)
}

// ดึงข้อมูลกระบวนการซักทั้งหมด
func GetLaundryProcesses(c *gin.Context) {
	var processes []entity.LaundryProcess

	if err := config.DB.Preload("Machines").Preload("Order").Find(&processes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, processes)
}

// ดึงข้อมูลกระบวนการซักล่าสุด
func GetLatestLaundryProcess(c *gin.Context) {
	var process entity.LaundryProcess
	if err := config.DB.Order("created_at desc").Preload("Machines").First(&process).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบกระบวนการซักล่าสุด"})
		return
	}
	c.JSON(http.StatusOK, process)
}

// อัปเดตสถานะ
func UpdateProcessStatus(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		Status     string `json:"status"`
		StatusNote string `json:"status_note"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var process entity.LaundryProcess
	if err := config.DB.Preload("Machines").First(&process, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบกระบวนการซัก"})
		return
	}

	// เงื่อนไขการเปลี่ยนสถานะ:
	// - 'กำลังซัก' ได้เมื่อสถานะก่อนหน้าเป็น 'รับผ้าเรียบร้อย'
	// - 'กำลังอบ' ได้เมื่อสถานะก่อนหน้าเป็น 'กำลังซัก'
	// - 'เสร็จสิ้น' ได้เมื่อสถานะก่อนหน้าเป็น 'กำลังอบ'
	if req.Status == "กำลังซัก" {
		if process.Status != "รับผ้าเรียบร้อย" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องรับผ้าเรียบร้อยก่อนถึงจะอัปเดตสถานะเป็น 'กำลังซัก' ได้"})
			return
		}
		// ต้องมีเครื่องซัก
		hasWasher := false
		for _, m := range process.Machines {
			if m.Machine_type == "washing" {
				hasWasher = true
				break
			}
		}
		if !hasWasher {
			c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาบันทึกเครื่องซักก่อนอัปเดตสถานะเป็น 'กำลังซัก'"})
			return
		}
	}
	if req.Status == "กำลังอบ" {
		if process.Status != "กำลังซัก" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องอัปเดตสถานะเป็น 'กำลังซัก' ก่อนถึงจะอัปเดตเป็น 'กำลังอบ' ได้"})
			return
		}
		// ต้องมีเครื่องอบ
		hasDryer := false
		for _, m := range process.Machines {
			if m.Machine_type == "drying" {
				hasDryer = true
				break
			}
		}
		if !hasDryer {
			c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาบันทึกเครื่องอบก่อนอัปเดตสถานะเป็น 'กำลังอบ'"})
			return
		}
	}
       if req.Status == "เสร็จสิ้น" {
	       if process.Status != "กำลังอบ" && process.Status != "กำลังซัก" {
		       c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องอัปเดตสถานะเป็น 'กำลังอบ' หรือ 'กำลังซัก' ก่อนถึงจะอัปเดตเป็น 'เสร็จสิ้น' ได้"})
		       return
	       }
	       process.End_time = time.Now()
	       // คืนสถานะเครื่องซัก/อบทั้งหมดของ process นี้เป็น available
	       for _, m := range process.Machines {
		       config.DB.Model(&entity.Machine{}).Where("id = ?", m.ID).Update("status", "available")
	       }
       }

	process.Status = req.Status
	process.Description = req.StatusNote

	if err := config.DB.Save(&process).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// PATCH: สร้าง Delivery Queue อัตโนมัติเมื่อ LaundryProcess เสร็จสิ้น
	if process.Status == "เสร็จสิ้น" {
		var orders []entity.Order
		if err := config.DB.Model(&process).Association("Order").Find(&orders); err == nil && len(orders) > 0 {
			for _, order := range orders {
				// เช็คว่ามี delivery queue สำหรับ order นี้หรือยัง
				var count int64
				config.DB.Model(&entity.Queue{}).Where("order_id = ? AND queue_type = ?", order.ID, "delivery").Count(&count)
				if count == 0 {
					queue := entity.Queue{
						Queue_type: "delivery",
						Status:     "waiting",
						OrderID:    order.ID,
					}
					config.DB.Create(&queue)
				}
			}
		}
	}

	c.JSON(http.StatusOK, process)
}

// ดึงข้อมูลเครื่องซัก/อบทั้งหมด (หรือเฉพาะที่ว่าง)
func GetMachines(c *gin.Context) {
	var machines []entity.Machine
	if err := config.DB.Find(&machines).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, machines)
}

// ผูกเครื่องซัก/อบ
func AssignMachinesToProcess(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		MachineIDs []uint `json:"machine_ids"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// โหลด process
	var process entity.LaundryProcess
	if err := config.DB.First(&process, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบกระบวนการซัก"})
		return
	}

	// ดึงเครื่องที่เลือกใหม่
	var machines []entity.Machine
	if len(req.MachineIDs) > 0 {
		if err := config.DB.Where("id IN ?", req.MachineIDs).Find(&machines).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่พบเครื่องซัก/อบที่เลือก"})
			return
		}
	}

	// ใช้ transaction เพื่อความชัวร์
	tx := config.DB.Begin()

	// คืนสถานะเครื่องเก่าเป็น available
	if err := tx.Model(&process).Association("Machines").Find(&process.Machines); err == nil {
		for _, om := range process.Machines {
			keep := false
			for _, mid := range req.MachineIDs {
				if om.ID == mid {
					keep = true
					break
				}
			}
			if !keep {
				if err := tx.Model(&entity.Machine{}).Where("id = ?", om.ID).
					Update("status", "available").Error; err != nil {
					tx.Rollback()
					c.JSON(500, gin.H{"error": "อัปเดตเครื่องเก่าไม่สำเร็จ"})
					return
				}
			}
		}
	}

	// เคลียร์ความสัมพันธ์เก่า
	if err := tx.Model(&process).Association("Machines").Clear(); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ล้างความสัมพันธ์เก่าไม่สำเร็จ"})
		return
	}

	// เพิ่มความสัมพันธ์ใหม่
	if len(machines) > 0 {
		if err := tx.Model(&process).Association("Machines").Append(machines); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "เพิ่มความสัมพันธ์ใหม่ไม่สำเร็จ"})
			return
		}

		// อัปเดตสถานะเครื่องที่เลือกใหม่ → in_use
		if err := tx.Model(&entity.Machine{}).
			Where("id IN ?", req.MachineIDs).
			Update("status", "in_use").Error; err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": "อัปเดตสถานะเครื่องไม่สำเร็จ"})
			return
		}
	}

	tx.Commit()

	// reload process + machines เพื่อส่งกลับ
	var updated entity.LaundryProcess
	if err := config.DB.Preload("Machines").First(&updated, id).Error; err != nil {
		c.JSON(200, gin.H{"message": "บันทึกเครื่องสำเร็จ"})
		return
	}

	c.JSON(200, gin.H{
		"message": "บันทึกเครื่องสำเร็จ",
		"process": updated,
	})
}

// ลบเครื่องซัก/อบ ออกจากกระบวนการซัก
// DELETE /laundry-process/:id/machines/:machineId
func DeleteMachineFromProcess(c *gin.Context) {
	processID := c.Param("id")
	machineID := c.Param("machineId")

	var process entity.LaundryProcess
	if err := config.DB.Preload("Machines").First(&process, processID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "process not found"})
		return
	}

	var machine entity.Machine
	if err := config.DB.First(&machine, machineID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "machine not found"})
		return
	}

	// ตรวจสอบว่า machine นี้อยู่ใน process จริงไหม
	found := false
	for _, m := range process.Machines {
		if m.ID == machine.ID {
			found = true
			break
		}
	}
	if !found {
		c.JSON(http.StatusBadRequest, gin.H{"error": "machine is not assigned to this process"})
		return
	}

	// ตัดความสัมพันธ์ระหว่าง process และ machine ออก
	if err := config.DB.Model(&process).Association("Machines").Delete(&machine); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove machine"})
		return
	}

	// อัปเดตสถานะเครื่องกลับเป็น available
	machine.Status = "available"
	if err := config.DB.Save(&machine).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update machine status"})
		return
	}

	// reload process เพื่อส่งข้อมูลล่าสุด
	var updated entity.LaundryProcess
	if err := config.DB.Preload("Machines").First(&updated, processID).Error; err != nil {
		updated = process
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ลบเครื่องสำเร็จ",
		"process": updated,
	})
}

// ดึง process ของ order
func GetProcessesByOrder(c *gin.Context) {
	orderID := c.Param("id")
	var processes []entity.LaundryProcess

	if err := config.DB.
		Joins("JOIN process_order ON process_order.laundry_process_id = laundry_processes.id").
		Where("process_order.order_id = ?", orderID).
		Preload("Machines").
		Find(&processes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, processes)
}

// ดึงเครื่องซักอบที่ว่าง
func GetAvailableMachines(c *gin.Context) {
	var machines []entity.Machine
	if err := config.DB.Where("status = ?", "available").Find(&machines).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, machines)
}

// ดึง order พร้อมสถานะล่าสุด
func GetOrdersdetails(c *gin.Context) {
       var orders []entity.Order
       config.DB.Preload("Customer").Preload("Address").Preload("LaundryProcesses").Preload("SortingRecord.SortedClothes").Find(&orders)

       var result []map[string]interface{}
       for _, o := range orders {
	       status := "รอดำเนินการ"
	       if len(o.LaundryProcesses) > 0 {
		       status = o.LaundryProcesses[len(o.LaundryProcesses)-1].Status
	       }
	       // รวมจำนวนชิ้นจาก SortedClothes ทั้งหมดใน SortingRecord
	       totalItems := 0
	       if o.SortingRecord != nil && o.SortingRecord.SortedClothes != nil {
		       for _, sc := range o.SortingRecord.SortedClothes {
			       totalItems += sc.SortedCount
		       }
	       }
	       // ดึงขนาดถังซัก/อบจาก ServiceTypes
	       washerCap := 0
	       dryerCap := 0
	       if o.ServiceTypes != nil {
		       for _, st := range o.ServiceTypes {
			       if st != nil && st.Type != "" {
				       if st.Type != "อบ" && st.Type != "ไม่อบ" && washerCap == 0 {
					       washerCap = st.Capacity
				       }
				       if st.Type == "อบ" && dryerCap == 0 {
					       dryerCap = st.Capacity
				       }
			       }
		       }
	       }
	       item := map[string]interface{}{
		       "ID":              o.ID,
		       "Customer":        o.Customer,
		       "Address":         o.Address,
		       "washer_capacity": washerCap,
		       "dryer_capacity":  dryerCap,
		       "totalItems":      totalItems,
		       "status":          status,
	       }
	       result = append(result, item)
       }

       c.JSON(200, result)
}
