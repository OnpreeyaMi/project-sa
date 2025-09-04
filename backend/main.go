// package main

// import (
// 	"fmt"
// 	"github.com/gin-gonic/gin"
//     "github.com/OnpreeyaMi/project-sa/backend/config"
    
//     "github.com/OnpreeyaMi/project-sa/backend/controller"


// )

// const port = 8080
// func main() {
// 	// เชื่อมต่อฐานข้อมูล
// 	config.ConnectDatabase()

//     // สร้าง table สำหรับ entity
//     config.SetupDatabase()

//     //สร้าง router
//     router := gin.Default()
// 	router.Use(CORSMiddleware())

//     //ตั้งค่า route
//     router.POST("/order", controller.CreateOrder)
// 	router.GET("/order-histories", controller.GetOrderHistories)

//     // รัน server
//     router.Run(fmt.Sprintf(":%d", port))

// }
// func CORSMiddleware() gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
// 		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
// 		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
// 		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE,PATCH")
// 		if c.Request.Method == "OPTIONS" {
// 			c.AbortWithStatus(204)
// 			return
// 		}
// 		c.Next()
// 	}
// }

package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/OnpreeyaMi/project-sa/backend/entity"
	"github.com/OnpreeyaMi/project-sa/backend/controller"
)

func main() {
	// เตือนถ้าไม่ได้ตั้ง ENV
	if os.Getenv("EASYSLIP_TOKEN") == "" {
		log.Println("[WARN] EASYSLIP_TOKEN is empty; set it in your environment")
	}

	db, err := gorm.Open(sqlite.Open("project_sa.db"), &gorm.Config{})
	if err != nil { panic(err) }

	if err := db.AutoMigrate(&entity.Payment{}); err != nil {
		panic(err)
	}

	r := gin.Default()

	// CORS
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	r.SetTrustedProxies(nil)
	r.POST("/verify-slip-base64", controller.VerifySlipBase64(db))

	log.Println("Listening on http://127.0.0.1:18080")
	if err := r.Run(":18080"); err != nil {
		log.Fatal(err)
	}
}
