package controller

import (
	"net/http"
	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/gin-gonic/gin"
)

// ดึงประวัติการสั่งซื้อทั้งหมด
func GetOrderHistories(c *gin.Context) {
	var histories []entity.OrderHistory

	// preload Order ด้วย (เพื่อดึงข้อมูล Order มาใช้ได้เลย เช่น ราคา/รูป/โน้ต)
	if err := config.DB.Preload("Order").Preload("Order.ServiceTypes").Preload("Order.Detergents").Find(&histories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Response struct
	type OrderHistoryResponse struct {
		ID            uint   `json:"id"`
		CreatedAt     string `json:"created_at"`
		Status        string `json:"status"`
		PaymentStatus string `json:"payment_status"`
		Price         int    `json:"price"`
	}

	var response []OrderHistoryResponse
	for _, h := range histories {
		order := h.Order
		total := 0
		if order != nil {
			if order.ServiceTypes != nil {
				for range order.ServiceTypes {
					// total += int(s.Price)
				}
			}
			if order.Detergents != nil {
				for range order.Detergents {
					// total += int(d.Price)
				}
			}
		}

		response = append(response, OrderHistoryResponse{
			ID:            h.ID,
			CreatedAt:     h.CreatedAt.Format("2006-01-02 15:04:05"),
			Status:        h.Status,
			PaymentStatus: "-", // TODO: ใส่ค่าจริงถ้ามี
			Price:         total,
		})
	}

	c.JSON(http.StatusOK, response)
}
