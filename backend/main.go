package main

import (
	"fmt"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/controller"
	"github.com/gin-gonic/gin"
)

const port = 8000

func main() {
	config.ConnectDatabase()
	config.SetupDatabase()

	router := gin.Default()
	router.Use(CORSMiddleware())

	// ตัวอย่างเดิม ...
	router.POST("/order", controller.CreateOrder)
	router.GET("/order-histories", controller.GetOrderHistories)

	// Employee CRUD
	router.POST("/employees", controller.CreateEmployee)
	router.GET("/employees", controller.ListEmployees)
	router.GET("/employees/:id", controller.GetEmployee)
	router.PUT("/employees/:id", controller.UpdateEmployee)
	router.DELETE("/employees/:id", controller.DeleteEmployee)

	// ===== ฝั่งพนักงาน =====
	// Upsert สำหรับออเดอร์ที่มีอยู่ (ไม่สร้าง/แก้ Order)
	router.POST("/laundry-checks/:orderId", controller.UpsertLaundryCheck)
	// Read-only จาก Order
	router.GET("/laundry-check/orders", controller.ListLaundryOrders)
	router.GET("/laundry-check/orders/:id", controller.GetLaundryOrderDetail)
	router.GET("/laundry-check/orders/:id/history", controller.GetOrderHistory)
	// Lookups
	router.GET("/clothtypes", controller.ListClothTypes)
	router.GET("/servicetypes", controller.ListServiceTypes)
	router.GET("/laundry-check/customers", controller.GetLaundryCustomers)

	
	// Laundry Process (คงเดิม)
	router.POST("/laundry-process", controller.CreateLaundryProcess)
	router.GET("/laundry-processes", controller.GetLaundryProcesses)
	router.GET("/laundry-process/latest", controller.GetLatestLaundryProcess)
	router.PUT("/laundry-process/:id", controller.UpdateProcessStatus)
	router.POST("/laundry-process/:id/machines", controller.AssignMachinesToProcess)
	router.GET("/orders/:id", controller.GetOrderByID)
	router.GET("/ordersdetails", controller.GetOrdersdetails)

	// Customer
	router.POST("/customers", controller.CreateCustomer)
	router.GET("/customers", controller.GetCustomers)
	router.PUT("/customers/:id", controller.UpdateCustomer)
	router.DELETE("/customers/:id", controller.DeleteCustomer)
	router.GET("/customers/:id", controller.GetCustomerByID)

	// Machine
	router.GET("/machines", controller.GetMachines)

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
