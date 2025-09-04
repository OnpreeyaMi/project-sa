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

	// เชื่อมกับ Order
	var order entity.Order
	if err := config.DB.First(&order, req.OrderID).Error; err != nil {
    c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบ Order"})
    return
	}
	process.Order = append(process.Order, &order)


	if err := config.DB.Create(&process).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, process)
}
//ดึง order by id
func GetOrderByID(c *gin.Context) {
    id := c.Param("id")
    var order entity.Order
    if err := config.DB.Preload("Customer").
        Preload("Address").
        Preload("LaundryProcesses.Machine").
        First(&order, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบ Order"})
        return
    }
    c.JSON(http.StatusOK, order)
}

// ดึงข้อมูลกระบวนการซักทั้งหมด
func GetLaundryProcesses(c *gin.Context) {
	var processes []entity.LaundryProcess

	if err := config.DB.Preload("Machine").Preload("Order").Find(&processes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, processes)
}

// ดึงข้อมูลกระบวนการซักล่าสุด
func GetLatestLaundryProcess(c *gin.Context) {
	var process entity.LaundryProcess
	if err := config.DB.Order("created_at desc").Preload("Machine").First(&process).Error; err != nil {
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
	if err := config.DB.First(&process, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบกระบวนการซัก"})
		return
	}

	process.Status = req.Status
	process.Description = req.StatusNote
	if req.Status == "เสร็จสิ้น" {
		process.End_time = time.Now()
	}

	if err := config.DB.Save(&process).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
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
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    var process entity.LaundryProcess
    if err := config.DB.Preload("Machine").First(&process, id).Error; err != nil {
        c.JSON(404, gin.H{"error": "ไม่พบกระบวนการซัก"})
        return
    }

    var machines []entity.Machine
    if err := config.DB.Find(&machines, req.MachineIDs).Error; err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    // เชื่อม Machine กับ Process (many2many)
    if err := config.DB.Model(&process).Association("Machine").Replace(machines); err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    // อัปเดตสถานะเครื่อง
    for _, m := range machines {
        m.Status = "in_use"
        config.DB.Save(&m)
    }

    c.JSON(200, gin.H{"message": "บันทึกเครื่องสำเร็จ"})
}

//ดึง process ของ order
func GetProcessesByOrder(c *gin.Context) {
	orderID := c.Param("id")
	var processes []entity.LaundryProcess

	if err := config.DB.
		Joins("JOIN process_orders ON process_orders.laundry_process_id = laundry_processes.id").
		Where("process_orders.order_id = ?", orderID).
		Preload("Machine").
		Find(&processes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, processes)
}
//ดึงเครืื่องซักอบที่ว่าง 
func GetAvailableMachines(c *gin.Context) {
    var machines []entity.Machine
    if err := config.DB.Where("status = ?", "available").Find(&machines).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, machines)
}
//ดึง order พร้อมสถานะล่าสุด
func GetOrdersdetails(c *gin.Context) {
    var orders []entity.Order
    config.DB.Preload("Customer").Preload("Address").Preload("LaundryProcesses").Find(&orders)

    // map status ล่าสุด
    var result []map[string]interface{}
    for _, o := range orders {
        status := "รอดำเนินการ"
        if len(o.LaundryProcesses) > 0 {
            status = o.LaundryProcesses[len(o.LaundryProcesses)-1].Status
        }
        item := map[string]interface{}{
            "ID": o.ID,
            "Customer": o.Customer,
			"Address": o.Address, 
            "washer_capacity": 10,   // ถ้ามีฟิลด์จริงจาก ServiceType
            "dryer_capacity": 14,
            "totalItems": 5,
            "status": status,
        }
        result = append(result, item)
    }

    c.JSON(200, result)
}
