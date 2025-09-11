// controller/orders_latest.go
package controller

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ดึงออเดอร์ล่าสุดของ "ลูกค้าที่ระบุตัวตนได้" (จาก JWT) หรือจาก ?customerId= (fallback)
func GetLatestOrderForCustomer(c *gin.Context) {
	var cid uint

	// --- วิธีที่แนะนำ: จาก JWT ---
	if v, ok := c.Get("customer_id"); ok {
		if vv, ok2 := v.(uint); ok2 && vv > 0 {
			cid = vv
		}
	}

	// --- Fallback: จาก query param ถ้ายังไม่มี JWT ---
	if cid == 0 {
		if q := c.Query("customerId"); q != "" {
			if n, err := strconv.ParseUint(q, 10, 64); err == nil {
				cid = uint(n)
			} else {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_customer_id"})
				return
			}
		}
	}

	if cid == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized_or_missing_customer"})
		return
	}

	var order entity.Order
	q := config.DB.Where("customer_id = ?", cid).Order("created_at DESC").Limit(1)
	if err := q.First(&order).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "no_order"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db_error"})
		return
	}

	// c.JSON(http.StatusOK, gin.H{
	// 	"orderId":   order.ID,
	// 	"status":    order.Status,     // ส่งเพิ่มได้ตามต้องใช้
	// 	"createdAt": order.CreatedAt,  // เผื่อเอาไปโชว์
	// })
}
