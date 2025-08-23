package main

import (
    "fmt"
	"github.com/OnpreeyaMi/project-sa/config"
    "github.com/gin-gonic/gin"
    "github.com/OnpreeyaMi/project-sa/controller/order"

)

const port = 8080
func main() {
    // เชื่อมต่อฐานข้อมูล
    config.ConnectDatabase()
    
    // สร้าง table สำหรับ entity
    config.SetupDatabase()

    // สร้าง router
    router := gin.Default()

    // ตั้งค่า route
    router.POST("/order", controller.CreateOrder)

    // รัน server
    router.Run(fmt.Sprintf(":%d", port))
}

