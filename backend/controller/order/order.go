package controller

import (
    "net/http"
    "github.com/OnpreeyaMi/project-sa/config"
    "github.com/OnpreeyaMi/project-sa/entity"
    "github.com/gin-gonic/gin"
)

// CreateOrder บันทึก Order ใหม่
func CreateOrder(c *gin.Context) {
    var input struct {
        OrderNo    string   `json:"order_no" binding:"required"`
        OrderDate  string   `json:"order_date" binding:"required"`
        Status     string   `json:"status"`
        CustomerID uint     `json:"customer_id" binding:"required"`
        AddressID  uint     `json:"address_id" binding:"required"`
        ServiceID  uint     `json:"service_id" binding:"required"`
        PaymentIDs []uint   `json:"payment_ids"`     
        DetergentIDs []uint `json:"detergent_ids"`  
    }

    // bind JSON
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // สร้าง Order
    order := entity.Order{
        OrderNo:    input.OrderNo,
        OrderDate:  input.OrderDate,
        Status:     input.Status,
        CustomerID: input.CustomerID,
        AddressID:  input.AddressID,
        ServiceID:  input.ServiceID,
    }

    // บันทึก Order ลง DB
    if err := config.DB.Create(&order).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // เพิ่ม Detergent ถ้ามี
    if len(input.DetergentIDs) > 0 {
        var detergents []entity.Detergent
        if err := config.DB.Find(&detergents, input.DetergentIDs).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }
        config.DB.Model(&order).Association("Detergents").Append(&detergents)
    }

    // เพิ่ม Payment ถ้ามี
    if len(input.PaymentIDs) > 0 {
        var payments []entity.Payment
        if err := config.DB.Find(&payments, input.PaymentIDs).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }
        config.DB.Model(&order).Association("Payments").Append(&payments)
    }

    c.JSON(http.StatusOK, gin.H{"message": "Order created successfully", "order": order})
}
