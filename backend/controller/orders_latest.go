// controller/orders_latest.go
package controller

import (
	"errors"
	"fmt"
	"net/http"
	"os"

	// "sort"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
)

type latestOrderResp struct {
	OrderID   uint      `json:"orderId"`
	Status    string    `json:"status,omitempty"`
	Amount    float64   `json:"amount,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
}

// helper: ดึงค่า uint จาก claims ตามรายชื่อคีย์ที่ให้มา
func uintFromClaims(claims jwt.MapClaims, keys ...string) uint {
	for _, k := range keys {
		if v, ok := claims[k]; ok {
			switch vv := v.(type) {
			case float64:
				return uint(vv)
			case int:
				return uint(vv)
			case string:
				var out uint
				_, _ = fmt.Sscanf(strings.TrimSpace(vv), "%d", &out)
				if out > 0 {
					return out
				}
			}
		}
	}
	return 0
}

func parseCustomerIDFromJWT(c *gin.Context) (uint, error) {
	auth := c.GetHeader("Authorization")
	if !strings.HasPrefix(auth, "Bearer ") {
		return 0, jwt.ErrTokenMalformed
	}
	raw := strings.TrimSpace(strings.TrimPrefix(auth, "Bearer "))

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return 0, jwt.ErrInvalidKey
	}

	token, err := jwt.Parse(raw, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrTokenUnverifiable
		}
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return 0, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, jwt.ErrTokenInvalidClaims
	}

	// 1) พยายามหา customer_id โดยตรงก่อน
	if cid := uintFromClaims(claims, "customer_id", "customerId", "cid"); cid > 0 {
		return cid, nil
	}

	// 2) ไม่เจอ → ลองใช้ user_id/id/sub แล้ว map ไปหา Customer.ID
	if uid := uintFromClaims(claims, "user_id", "id", "sub", "userId"); uid > 0 {
		var cust entity.Customer
		if err := config.DB.Where("user_id = ?", uid).First(&cust).Error; err == nil && cust.ID > 0 {
			return cust.ID, nil
		}
		// บางระบบเก็บ relation แบบอื่น: ถ้าคุณมีตาราง map ให้เพิ่ม logic ตรงนี้
	}

	return 0, jwt.ErrTokenInvalidClaims
}

func GetLatestOrderForCustomer(c *gin.Context) {
    customerIdStr := c.Param("customer_id")	
	customerID, err := strconv.ParseUint(customerIdStr,10,32)
	if err != nil{
		c.JSON(http.StatusBadRequest,gin.H{"error": "Invalid CustomerId"})
		return
	}
	// ดึงออเดอร์ล่าสุด
	var orders entity.Order
	if err := config.DB.Where("customer_id = ?", customerID).Order("created_at DESC").First(&orders).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "no_orders"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db_error"})
		return
	}
	// if len(orders) == 0 {
	// 	c.JSON(http.StatusNotFound, gin.H{"error": "no_orders"})
	// 	return
	// }
	// sort.Slice(orders, func(i, j int) bool { return orders[i].CreatedAt.After(orders[j].CreatedAt) })
	// o := orders[0]

	resp := latestOrderResp{
		OrderID:   orders.ID,
		CreatedAt: orders.CreatedAt,
	}
	c.JSON(http.StatusOK, resp)
}
