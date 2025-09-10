package controller

import (
	"fmt"
)

import (
	"net/http"
	"strings"
	"time"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/gin-gonic/gin"
)

// Get queues by type (pickup / delivery)
func GetQueues(c *gin.Context) {
	queueType := c.Query("type") // pickup หรือ delivery

	var queues []entity.Queue
	if err := config.DB.Preload("Order.Customer").Preload("Order.Address").
		Where("queue_type = ?", queueType).
		Find(&queues).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, queues)
}

// Create Pickup Queue เมื่อมี Order ใหม่ (ยังไม่เลือก TimeSlot)
func CreatePickupQueue(c *gin.Context) {
       var input struct {
	       OrderID uint `json:"order_id"`
       }
       if err := c.ShouldBindJSON(&input); err != nil {
	       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	       return
       }
       queue := entity.Queue{
	       Queue_type: strings.ToLower(strings.TrimSpace("pickup")),
	       Status:     strings.ToLower(strings.TrimSpace("waiting")),
	       OrderID:    input.OrderID,
	       // ยังไม่ assign TimeSlot
       }
       if err := config.DB.Create(&queue).Error; err != nil {
	       c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	       return
       }
       c.JSON(http.StatusOK, queue)
}

// Assign TimeSlot ให้ Queue (ตรวจสอบ capacity ก่อน assign)
func AssignTimeSlotToQueue(c *gin.Context) {
       id := c.Param("id")
       var input struct {
	       TimeSlotID *uint `json:"time_slot_id"`
       }
       if err := c.ShouldBindJSON(&input); err != nil {
	       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	       return
       }
       if input.TimeSlotID == nil {
	       c.JSON(http.StatusBadRequest, gin.H{"error": "TimeSlotID is required"})
	       return
       }
       var queue entity.Queue
       if err := config.DB.First(&queue, id).Error; err != nil {
	       c.JSON(http.StatusNotFound, gin.H{"error": "Queue not found"})
	       return
       }
       var timeslot entity.TimeSlot
       if err := config.DB.First(&timeslot, *input.TimeSlotID).Error; err != nil {
	       c.JSON(http.StatusNotFound, gin.H{"error": "TimeSlot not found"})
	       return
       }
       // ตรวจสอบ capacity
       var count int64
       config.DB.Model(&entity.Queue{}).Where("time_slot_id = ?", *input.TimeSlotID).Count(&count)
       if int(count) >= timeslot.Capacity {
	       c.JSON(http.StatusBadRequest, gin.H{"error": "TimeSlot is full"})
	       return
       }
       queue.TimeSlotID = input.TimeSlotID
       if err := config.DB.Save(&queue).Error; err != nil {
	       c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	       return
       }
       // อัปเดต status ของ TimeSlot ถ้าเต็ม
       if int(count+1) >= timeslot.Capacity {
	       timeslot.Status = "full"
	       config.DB.Save(&timeslot)
       }
       c.JSON(http.StatusOK, queue)
}

// Accept Queue (pickup หรือ delivery)
func AcceptQueue(c *gin.Context) {
	id := c.Param("id")
	var queue entity.Queue
	if err := config.DB.First(&queue, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Queue not found"})
		return
	}

	var input struct {
		EmployeeID uint `json:"employee_id"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

       t := strings.ToLower(strings.TrimSpace(queue.Queue_type))
       if t == "pickup" {
	       queue.Status = "pickup_in_progress"
       } else if t == "delivery" {
	       queue.Status = "delivery_in_progress"
       }

	assignment := entity.QueueAssignment{
		QueueID:      queue.ID,
		EmployeeID:   input.EmployeeID,
		Assigned_time: time.Now(),
	}

	if err := config.DB.Save(&queue).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&assignment).Error; err != nil {
		// log error และแจ้งกลับ frontend
		fmt.Println("Error creating QueueAssignment:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create QueueAssignment", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, queue)
}

// Confirm Pickup Done → เปลี่ยนสถานะ และสร้าง Delivery Queue
func ConfirmPickupDone(c *gin.Context) {
	id := c.Param("id")
	var queue entity.Queue
	if err := config.DB.First(&queue, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Queue not found"})
		return
	}

	// รับ employee_id จาก body
	var input struct {
		EmployeeID uint `json:"employee_id"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	queue.Status = "done"
	if err := config.DB.Save(&queue).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// สร้าง QueueAssignment ใหม่ (ถ้ายังไม่มี)
	assignment := entity.QueueAssignment{
		QueueID:      queue.ID,
		EmployeeID:   input.EmployeeID,
		Assigned_time: time.Now(),
	}
	if err := config.DB.Create(&assignment).Error; err != nil {
		fmt.Println("Error creating QueueAssignment (pickup_done):", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create QueueAssignment", "details": err.Error()})
		return
	}

	// เพิ่มประวัติลง QueueHistory เมื่อ Pickup เสร็จ
	history := entity.QueueHistory{
		QueueID: queue.ID,
	}
	if err := config.DB.Create(&history).Error; err != nil {
		fmt.Println("Error creating QueueHistory (pickup_done):", err)
	}

	// อัปเดต LaundryProcess ล่าสุดของ order นี้เป็น 'รับผ้าเรียบร้อย'
	var process entity.LaundryProcess
	if err := config.DB.Joins("JOIN process_order ON process_order.laundry_process_id = laundry_processes.id").
		Where("process_order.order_id = ?", queue.OrderID).
		Order("laundry_processes.created_at desc").
		First(&process).Error; err == nil {
		process.Status = "รับผ้าเรียบร้อย"
		config.DB.Save(&process)
	}

	c.JSON(http.StatusOK, gin.H{"pickup_done": queue})
}

// Confirm Delivery Done
func ConfirmDeliveryDone(c *gin.Context) {
	id := c.Param("id")
	var queue entity.Queue
	if err := config.DB.First(&queue, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Queue not found"})
		return
	}

	// รับ employee_id จาก body
	var input struct {
		EmployeeID uint `json:"employee_id"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	queue.Status = "delivered"
	if err := config.DB.Save(&queue).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// สร้าง QueueAssignment ใหม่ (ถ้ายังไม่มี)
	assignment := entity.QueueAssignment{
		QueueID:      queue.ID,
		EmployeeID:   input.EmployeeID,
		Assigned_time: time.Now(),
	}
	if err := config.DB.Create(&assignment).Error; err != nil {
		fmt.Println("Error creating QueueAssignment (delivery_done):", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create QueueAssignment", "details": err.Error()})
		return
	}

	// เพิ่มประวัติลง QueueHistory เมื่อ Delivery เสร็จ
	history := entity.QueueHistory{
		QueueID: queue.ID,
	}
	if err := config.DB.Create(&history).Error; err != nil {
		fmt.Println("Error creating QueueHistory (delivery_done):", err)
	}

	c.JSON(http.StatusOK, queue)
}
// Delete Queue by ID
func DeleteQueue(c *gin.Context) {
	id := c.Param("id")
	var queue entity.Queue
	if err := config.DB.First(&queue, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Queue not found"})
		return
	}
	if err := config.DB.Delete(&queue).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": queue})
}

// Update Queue by ID (status, employee)
func UpdateQueue(c *gin.Context) {
       id := c.Param("id")
       var queue entity.Queue
       if err := config.DB.First(&queue, id).Error; err != nil {
	       c.JSON(http.StatusNotFound, gin.H{"error": "Queue not found"})
	       return
       }
       var input struct {
	       Status     *string `json:"status"`
	       EmployeeID *uint   `json:"employee_id"`
       }
       if err := c.ShouldBindJSON(&input); err != nil {
	       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	       return
       }
       if input.Status != nil {
	       queue.Status = *input.Status
       }
       if input.EmployeeID != nil && queue.Queueassignment != nil {
	       queue.Queueassignment.EmployeeID = *input.EmployeeID
       }
       if err := config.DB.Save(&queue).Error; err != nil {
	       c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	       return
       }
       c.JSON(http.StatusOK, queue)
}
// GET /timeslots?type=pickup|delivery
func GetTimeSlots(c *gin.Context) {
	typeParam := c.Query("type")
	var timeslots []entity.TimeSlot
	db := config.DB
	if typeParam != "" {
		db = db.Where("slot_type = ?", typeParam)
	}
	if err := db.Find(&timeslots).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, timeslots)
}
// Get all queue histories
func GetQueueHistories(c *gin.Context) {
       var histories []entity.QueueHistory
       if err := config.DB.Preload("Queues.Order.Customer").Preload("Queues.Order.Address").Order("created_at desc").Find(&histories).Error; err != nil {
	       c.JSON(500, gin.H{"error": err.Error()})
	       return
       }
       c.JSON(200, histories)
}