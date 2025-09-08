package controller

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

// Create Pickup Queue เมื่อมี Order ใหม่
func CreatePickupQueue(c *gin.Context) {
	var input struct {
		OrderID    uint `json:"order_id"`
		TimeSlotID uint `json:"time_slot_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	   queue := entity.Queue{
		   Queue_type: strings.ToLower(strings.TrimSpace("pickup")),
		   Status:     strings.ToLower(strings.TrimSpace("waiting")),
		   OrderID:    input.OrderID,
		   TimeSlotID: input.TimeSlotID,
	   }

	if err := config.DB.Create(&queue).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
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
	config.DB.Create(&assignment)

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

	queue.Status = "done"
	if err := config.DB.Save(&queue).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Create delivery queue
	   deliveryQueue := entity.Queue{
		   Queue_type: strings.ToLower(strings.TrimSpace("delivery")),
		   Status:     strings.ToLower(strings.TrimSpace("waiting")),
		   OrderID:    queue.OrderID,
		   TimeSlotID: queue.TimeSlotID,
	   }
	   config.DB.Create(&deliveryQueue)

	c.JSON(http.StatusOK, gin.H{"pickup_done": queue, "delivery_queue_created": deliveryQueue})
}

// Confirm Delivery Done
func ConfirmDeliveryDone(c *gin.Context) {
	id := c.Param("id")
	var queue entity.Queue
	if err := config.DB.First(&queue, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Queue not found"})
		return
	}

	queue.Status = "delivered"
	if err := config.DB.Save(&queue).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, queue)
}
