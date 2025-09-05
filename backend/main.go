package main

import (
	"fmt"
	"time"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/controller"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

const port = 8000

func main() {
	// เชื่อมต่อฐานข้อมูล
	config.ConnectDatabase()

	// สร้าง table สำหรับ entity
	config.SetupDatabase()

	// สร้าง router
	router := gin.Default()

	// ตั้งค่า CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // frontend origin
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// ตั้งค่า routes
	// Customer routes
	router.POST("/customers", controller.CreateCustomer)
	router.GET("/customers", controller.GetCustomers)
	router.GET("/customers/:id", controller.GetCustomerByID)
	router.PUT("/customers/:id", controller.UpdateCustomer)
	router.DELETE("/customers/:id", controller.DeleteCustomer)
	router.GET("/customer/profile", controller.GetCustomerProfile)

	// Order routes
	router.GET("/orders", controller.GetOrders)
	router.POST("/orders", controller.CreateOrder)

	// Promotion routes
	router.POST("/promotions", controller.CreatePromotion)
	router.GET("/promotions", controller.GetPromotions)
	router.GET("/promotions/:id", controller.GetPromotionByID)
	router.PUT("/promotions/:id", controller.UpdatePromotion)
	router.DELETE("/promotions/:id", controller.DeletePromotion)

	// รัน server
	router.Run(fmt.Sprintf(":%d", port))
}
