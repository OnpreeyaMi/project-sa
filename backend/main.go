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
	_ = router.SetTrustedProxies(nil) // ปิด warning trusted proxies
	router.Use(CORSMiddleware())

	// ---------- Orders / Addresses ----------
	router.POST("/order", controller.CreateOrder)
	router.GET("/order-histories", controller.GetOrderHistories)
	router.GET("/addresses", controller.GetAddresses)
	router.GET("/customers/name/:id", controller.GetCustomerNameByID)
	router.POST("/orderaddress", controller.CreateAddress)
	router.GET("/detergents/type/:type", controller.GetDetergentsByType)
	router.PUT("/addresses/set-main", controller.UpdateMainAddress)

	// ---------- Detergents ----------
	router.POST("/detergents", controller.CreateDetergent)
	router.POST("/detergents/purchase", controller.CreateDetergentWithPurchase)
	router.GET("/detergents", controller.GetDetergents)
	router.DELETE("/detergents/:id", controller.DeleteDetergent)
	router.GET("/detergents/purchase-history", controller.GetPurchaseDetergentHistory)
	router.POST("/detergents/use", controller.UseDetergent)
	router.GET("/detergents/usage-history", controller.GetDetergentUsageHistory)

	// ---------- Employees ----------
	router.POST("/employees", controller.CreateEmployee)
	router.GET("/employees", controller.ListEmployees)
	router.GET("/employees/:id", controller.GetEmployee)
	router.PUT("/employees/:id", controller.UpdateEmployee)
	router.DELETE("/employees/:id", controller.DeleteEmployee)

	// ---------- Laundry Check (พนักงาน) ----------
	// Create/Append
	router.POST("/laundry-checks/:orderId", controller.UpsertLaundryCheck)
	// Read (ออเดอร์ล่าสุด = ส่งเฉพาะที่ “ยังไม่ถูกบันทึก”)
	router.GET("/laundry-check/orders", controller.ListLaundryOrders)
	router.GET("/laundry-check/orders/:id", controller.GetLaundryOrderDetail)
	router.GET("/laundry-check/orders/:id/history", controller.GetOrderHistory)
	// Update/Delete รายการผ้า
	router.PUT("/laundry-checks/:orderId/items/:itemId", controller.UpdateSortedClothes)
	router.DELETE("/laundry-checks/:orderId/items/:itemId", controller.DeleteSortedClothes)

	// ---------- Lookups ----------
	router.GET("/clothtypes", controller.ListClothTypes)
	router.GET("/servicetypes", controller.ListServiceTypes)
	router.GET("/laundry-check/customers", controller.GetLaundryCustomers)

	// ---------- Laundry Process ----------
	router.POST("/laundry-process", controller.CreateLaundryProcess)
	router.GET("/laundry-processes", controller.GetLaundryProcesses)
	router.GET("/laundry-process/latest", controller.GetLatestLaundryProcess)
	router.PUT("/laundry-process/:id", controller.UpdateProcessStatus)
	router.POST("/laundry-process/:id/machines", controller.AssignMachinesToProcess)

	// ---------- Orders (อื่นๆ) ----------
	router.GET("/orders/:id", controller.GetOrderByID)
	router.GET("/process/:id/order", controller.GetProcessesByOrder)
	router.GET("/ordersdetails", controller.GetOrdersdetails)

	// ---------- Customers ----------
	router.POST("/customers", controller.CreateCustomer)
	router.GET("/customers", controller.GetCustomers)
	router.PUT("/customers/:id", controller.UpdateCustomer)
	router.DELETE("/customers/:id", controller.DeleteCustomer)
	router.GET("/customers/:id", controller.GetCustomerByID)

	// ---------- Machines ----------
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
