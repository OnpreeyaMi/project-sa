// package middlewares

// import (
//     "net/http"
//     "github.com/gin-gonic/gin"
//     "strings"
//     "errors"
//     "os"
    
//     "github.com/golang-jwt/jwt/v5"
    
// )

// // จำกัดขนาด request body ทั้งก้อน (เช่น 50MB)
// func MaxBodyBytes(limit int64) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, limit)
// 		c.Next()
// 	}
// }

// type jwtClaims struct {
//     UserID uint `json:"user_id"` // หรือ Sub string ตาม token ของคุณ
//     jwt.RegisteredClaims
// }

// func Authorizes() gin.HandlerFunc {
//     return func(c *gin.Context) {
//         auth := c.GetHeader("Authorization")
//         parts := strings.Fields(auth)
//         if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
//             c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Incorrect Format of Authorization Token"})
//             return
//         }
//         tokenStr := parts[1]

//         secret := os.Getenv("JWT_SECRET")
//         if secret == "" {
//             c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "server jwt secret is not set"})
//             return
//         }

//         token, err := jwt.ParseWithClaims(tokenStr, &jwtClaims{}, func(t *jwt.Token) (interface{}, error) {
//             if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
//                 return nil, errors.New("unexpected signing method")
//             }
//             return []byte(secret), nil
//         })
//         if err != nil {
//             c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
//             return
//         }

//         claims, ok := token.Claims.(*jwtClaims)
//         if !ok || !token.Valid {
//             c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
//             return
//         }

//         // ถ้าใช้ Sub string:
//         // uid, _ := strconv.ParseUint(claims.Sub, 10, 64)
//         // c.Set("userID", uint(uid))

//         c.Set("userID", claims.UserID)
//         c.Next()
//     }
// }