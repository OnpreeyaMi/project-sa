package middlewares

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type CustomerClaims struct {
	CustomerID uint `json:"customer_id"`
	jwt.RegisteredClaims
}

// ดึง Bearer token จาก Header หรือ cookie (ถ้าต้องการ)
func extractToken(c *gin.Context) (string, bool) {
	// 1) จาก Authorization header
	auth := c.GetHeader("Authorization")
	if strings.HasPrefix(strings.ToLower(auth), "bearer ") {
		return strings.TrimSpace(auth[7:]), true
	}
	// 2) (ออปชัน) จาก cookie ชื่อ access_token
	if cookie, err := c.Cookie("access_token"); err == nil && cookie != "" {
		return cookie, true
	}
	return "", false
}

func AuthRequired() gin.HandlerFunc {
	secret := strings.TrimSpace(os.Getenv("JWT_SECRET"))
	return func(c *gin.Context) {
		tokenStr, ok := extractToken(c)
		if !ok || tokenStr == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing_token"})
			return
		}
		if secret == "" {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "server_not_configured"})
			return
		}

		claims := &CustomerClaims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (any, error) {
			// รับเฉพาะ HMAC เท่านั้น
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrTokenUnverifiable
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid_token"})
			return
		}

		// ต้องมี customer_id > 0
		if claims.CustomerID == 0 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid_customer"})
			return
		}

		// ใส่ลง context ให้ตัว controller เรียกใช้
		c.Set("customer_id", claims.CustomerID)
		c.Next()
	}
}
