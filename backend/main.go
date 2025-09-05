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
	"fmt"

	"github.com/OnpreeyaMi/project-sa/config"
    "github.com/gin-gonic/gin"
    "github.com/OnpreeyaMi/project-sa/controller"

	
)

const port = 8000

func main() {
	config.ConnectDatabase()
	config.SetupDatabase()

	router := gin.Default()
	router.Use(CORSMiddleware())

	// ตัวอย่าง route อื่น
	router.POST("/order", controller.CreateOrder)
	router.GET("/order-histories", controller.GetOrderHistories)
	// router.GET("/addresses", controller.GetAddresses)

	
	// router.POST("/detergents", controller.CreateDetergent)
	// router.POST("/detergents/purchase", controller.CreateDetergentWithPurchase)
	// router.GET("/detergents", controller.GetDetergents)
	// router.DELETE("/detergents/:id", controller.DeleteDetergent)

	

	// Employee CRUD
	router.POST("/employees", controller.CreateEmployee)
	router.GET("/employees", controller.ListEmployees)
	router.GET("/employees/:id", controller.GetEmployee)
	router.PUT("/employees/:id", controller.UpdateEmployee)
	router.DELETE("/employees/:id", controller.DeleteEmployee)

	// LaundryCheck
	router.POST("/laundry-checks", controller.CreateLaundryCheck)
	router.POST("/laundry-checks/:id/items", controller.AddLaundryItems)
	router.GET("/laundry-check/orders", controller.ListLaundryOrders)
	router.GET("/laundry-check/orders/:id", controller.GetLaundryOrderDetail)
	router.GET("/clothtypes", controller.ListClothTypes)
	router.GET("/servicetypes", controller.ListServiceTypes)
	router.GET("/laundry-check/customers", controller.GetLaundryCustomers)

	// Laundry Process
    router.POST("/laundry-process", controller.CreateLaundryProcess)      // บันทึก process ใหม่
    router.GET("/laundry-processes", controller.GetLaundryProcesses)      // ดึงทั้งหมด
    router.GET("/laundry-process/latest", controller.GetLatestLaundryProcess) //  ดึงล่าสุด
    router.PUT("/laundry-process/:id", controller.UpdateProcessStatus)    // อัปเดตสถานะ
    router.POST("/laundry-process/:id/machines", controller.AssignMachinesToProcess) //  เลือกเครื่อง
	router.GET("/orders/:id", controller.GetOrderByID)
	router.GET("/ordersdetails", controller.GetOrdersdetails) // ดึง order ทั้งหมด (สำหรับหน้า admin)

	// Customer
	router.POST("/customers", controller.CreateCustomer) // สร้างลูกค้า
	router.GET("/customers", controller.GetCustomers)    // ดึงลูกค้าทั้งหมด		
	router.PUT("/customers/:id", controller.UpdateCustomer) // แก้ไขลูกค้า
	router.DELETE("/customers/:id", controller.DeleteCustomer) // ลบลูกค้า
	router.GET("/customers/:id", controller.GetCustomerByID) // ดึงลูกค้าตาม ID

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
