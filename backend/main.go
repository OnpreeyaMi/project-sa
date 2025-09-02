package main

import (
	"fmt"

	"github.com/OnpreeyaMi/project-sa/config"
<<<<<<< HEAD
    "github.com/gin-gonic/gin"
    "github.com/OnpreeyaMi/project-sa/controller"

=======
	
	"github.com/gin-gonic/gin"
	"github.com/OnpreeyaMi/project-sa/controller"
>>>>>>> ae0b4f670b0322212318d085cd9a6f1b63f7af06
)

const port = 8080
func main() {
	// เชื่อมต่อฐานข้อมูล
	config.ConnectDatabase()

    // สร้าง table สำหรับ entity
    config.SetupDatabase()

    //สร้าง router
    router := gin.Default()
	router.Use(CORSMiddleware())

    //ตั้งค่า route
    router.POST("/order", controller.CreateOrder)
	router.GET("/order-histories", controller.GetOrderHistories)

    // รัน server
    router.Run(fmt.Sprintf(":%d", port))

<<<<<<< HEAD
}
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE,PATCH")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
=======
>>>>>>> ae0b4f670b0322212318d085cd9a6f1b63f7af06
}
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE,PATCH")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}