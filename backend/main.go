package main

import (
	"fmt"

	"github.com/OnpreeyaMi/project-sa/config"
    "github.com/gin-gonic/gin"
    "github.com/OnpreeyaMi/project-sa/controller"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/controller"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

const port = 8080

func main() {
	config.ConnectDatabase()
	config.SetupDatabase()

	router := gin.Default()
	router.Use(CORSMiddleware())

	// ตัวอย่าง route อื่น
	router.POST("/order", controller.CreateOrder)
	router.GET("/order-histories", controller.GetOrderHistories)
	router.GET("/addresses", controller.GetAddresses)
	router.GET("/customers/:id", controller.GetCustomerByID)
	
	router.POST("/detergents", controller.CreateDetergent)
	router.POST("/detergents/purchase", controller.CreateDetergentWithPurchase)
	router.GET("/detergents", controller.GetDetergents)
	router.DELETE("/detergents/:id", controller.DeleteDetergent)

	

	// Employee CRUD
	router.POST("/employees", controller.CreateEmployee)
	router.GET("/employees", controller.ListEmployees)
	router.GET("/employees/:id", controller.GetEmployee)
	router.PUT("/employees/:id", controller.UpdateEmployee)
	router.DELETE("/employees/:id", controller.DeleteEmployee)

	// Laundry Process
    router.POST("/laundry-process", controller.CreateLaundryProcess)      // บันทึก process ใหม่
    router.GET("/laundry-processes", controller.GetLaundryProcesses)      // ดึงทั้งหมด
    router.GET("/laundry-process/latest", controller.GetLatestLaundryProcess) //  ดึงล่าสุด
    router.PUT("/laundry-process/:id", controller.UpdateProcessStatus)    // อัปเดตสถานะ
    router.POST("/laundry-process/:id/machines", controller.AssignMachinesToProcess) //  เลือกเครื่อง
	router.GET("/orders/:id", controller.GetOrderByID)
	router.GET("/ordersdetails", controller.GetOrdersdetails) // ดึง order ทั้งหมด (สำหรับหน้า admin)

    // Machine
    router.GET("/machines", controller.GetMachines)   // ดึงเครื่องทั้งหมด

	// รัน server
	router.Run(fmt.Sprintf(":%d", port))
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
