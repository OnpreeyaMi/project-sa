package main

import (
	"fmt"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/controller"
	"github.com/OnpreeyaMi/project-sa/middlewares"
	"github.com/gin-gonic/gin"
)

const port = 8000

func main() {
	config.ConnectDatabase()
	config.SetupDatabase()

	router := gin.Default()
	_ = router.SetTrustedProxies(nil)
	router.Use(CORSMiddleware())

	// Public
	router.POST("/login", controller.Login)

	// Authenticated (customer scope)
	customerRoutes := router.Group("/customer")
	customerRoutes.Use(middlewares.AuthMiddleware())
	{
		customerRoutes.GET("/profile", controller.GetCustomerProfile)
		customerRoutes.PUT("/profile", controller.EditCustomerProfile)
		customerRoutes.POST("/addresses", controller.CreateAddress)
		customerRoutes.PUT("/addresses/:id", controller.UpdateAddress)
		customerRoutes.PUT("/addresses/:id/main", controller.SetMainAddress)
		customerRoutes.DELETE("/addresses/:id", controller.DeleteAddress)
	}

	// Convenience endpoint for employee (need token)
	router.GET("/employee/me", middlewares.AuthMiddleware(), controller.GetEmployeeMe)

	// Admin customers
	adminCustomerRoutes := router.Group("/customers")
	{
		adminCustomerRoutes.POST("", controller.CreateCustomer)
		adminCustomerRoutes.GET("", controller.GetCustomers)
		adminCustomerRoutes.GET("/:id", controller.GetCustomerByID)
		adminCustomerRoutes.PUT("/:id", controller.UpdateCustomer)
		adminCustomerRoutes.DELETE("/:id", controller.DeleteCustomer)
	}

	// Orders / Addresses (public or adjust as needed)
	router.POST("/order", controller.CreateOrder)
	router.GET("/order-histories", controller.GetOrderHistories)
	router.GET("/addresses", controller.GetAddresses)
	router.GET("/customers/name/:id", controller.GetCustomerNameByID)
	router.POST("/orderaddress", controller.CreateAddress)
	router.GET("/detergents/type/:type", controller.GetDetergentsByType)
	router.PUT("/addresses/set-main", controller.UpdateMainAddress)

	// Detergents
	router.POST("/detergents", controller.CreateDetergent)
	router.POST("/detergents/purchase", controller.CreateDetergentWithPurchase)
	router.GET("/detergents", controller.GetDetergents)
	router.DELETE("/detergents/:id", controller.DeleteDetergent)
	router.GET("/detergents/purchase-history", controller.GetPurchaseDetergentHistory)
	router.POST("/detergents/use", controller.UseDetergent)
	router.GET("/detergents/usage-history", controller.GetDetergentUsageHistory)

	// Employees
	router.POST("/employees", controller.CreateEmployee)
	router.GET("/employees", controller.ListEmployees)
	router.GET("/employees/:id", controller.GetEmployee)
	router.PUT("/employees/:id", controller.UpdateEmployee)
	router.DELETE("/employees/:id", controller.DeleteEmployee)

	// Laundry Check (employee)
	router.POST("/laundry-checks/:orderId", controller.UpsertLaundryCheck)
	router.GET("/laundry-check/orders", controller.ListLaundryOrders)
	router.GET("/laundry-check/orders/:id", controller.GetLaundryOrderDetail)
	router.GET("/laundry-check/orders/:id/history", controller.GetOrderHistory)
	router.PUT("/laundry-checks/:orderId/items/:itemId", controller.UpdateSortedClothes)
	router.DELETE("/laundry-checks/:orderId/items/:itemId", controller.DeleteSortedClothes)
	// Lookups
	router.GET("/clothtypes", controller.ListClothTypes)
	router.GET("/servicetypes", controller.ListServiceTypes)
	router.GET("/laundry-check/customers", controller.GetLaundryCustomers)

	// Laundry Process
	router.POST("/laundry-process", controller.CreateLaundryProcess)
	router.GET("/laundry-processes", controller.GetLaundryProcesses)
	router.GET("/laundry-process/latest", controller.GetLatestLaundryProcess)
	router.PUT("/laundry-process/:id", controller.UpdateProcessStatus)
	router.POST("/laundry-process/:id/machines", controller.AssignMachinesToProcess)

	// Orders (อื่นๆ)
	router.GET("/orders/:id", controller.GetOrderByID)
	router.GET("/process/:id/order", controller.GetProcessesByOrder)
	router.GET("/ordersdetails", controller.GetOrdersdetails)

	// Machines
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
