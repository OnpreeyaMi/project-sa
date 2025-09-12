package controller

import (
	"fmt"
	"net/http"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// -------------------- CREATE --------------------
type CustomerCreatePayload struct {
	FirstName string `json:"firstName" binding:"required"`
	LastName  string `json:"lastName" binding:"required"`
	Phone     string `json:"phone" binding:"required"`
	GenderID  uint   `json:"genderId" binding:"required"`
	Email     string `json:"email" binding:"required"`
	Password  string `json:"password" binding:"required"`
}

func CreateCustomer(c *gin.Context) {
	var payload CustomerCreatePayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// เช็ค email ซ้ำก่อนสร้าง user
	var existingUser entity.User
	if err := config.DB.Where("email = ? AND deleted_at IS NULL", payload.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email นี้ถูกใช้ไปแล้ว"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(payload.Password), 14)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	user := entity.User{
		Email:    payload.Email,
		Password: string(hashedPassword),
		RoleID:   2, // ลูกค้าอัตโนมัติ
	}
	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	customer := entity.Customer{
		FirstName:   payload.FirstName,
		LastName:    payload.LastName,
		PhoneNumber: payload.Phone,
		GenderID:    payload.GenderID,
		UserID:      user.ID,
	}

	if err := config.DB.Create(&customer).Error; err != nil {
		fmt.Println("Create customer error:", err) // เพิ่มบรรทัดนี้
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var createdCustomer entity.Customer
	config.DB.Preload("User").Preload("Gender").First(&createdCustomer, customer.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Customer created successfully",
		"data":    createdCustomer,
	})
}

// -------------------- READ --------------------
// สำหรับ admin ดึงลูกค้าแต่ละคน
func GetCustomerByID(c *gin.Context) {
	id := c.Param("id")
	var customer entity.Customer
	if err := config.DB.Preload("User").Preload("Gender").Preload("Addresses").Preload("Orders", func(db *gorm.DB) *gorm.DB {
        return db.Order("created_at DESC") // ดึงทั้งหมด เรียงล่าสุดก่อน
    }).Preload("Orders.Customer").Preload("Orders.Customer.Addresses").
		First(&customer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}
	// ถ้า User ยัง nil ให้ดึงใหม่
	if customer.User == nil && customer.UserID != 0 {
		var user entity.User
		if err := config.DB.First(&user, customer.UserID).Error; err == nil {
			customer.User = &user
		}
	}
	c.JSON(http.StatusOK, customer)
}

// ดึงลูกค้า profile ของตัวเอง (หน้า profile)
func GetCustomerProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var customer entity.Customer
	if err := config.DB.
		Preload("User").
		Preload("Addresses").
		Preload("Gender").
		First(&customer, "user_id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}

	c.JSON(http.StatusOK, customer)
}

// ดึงลูกค้าทั้งหมด (หน้า admin)
func GetCustomers(c *gin.Context) {
	var customers []entity.Customer
	if err := config.DB.Preload("User").Preload("Gender").Find(&customers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// Force reload User for each customer if missing
	for i, cust := range customers {
		if cust.User == nil && cust.UserID != 0 {
			var user entity.User
			if err := config.DB.First(&user, cust.UserID).Error; err == nil {
				customers[i].User = &user
			}
		}
	}
	c.JSON(http.StatusOK, customers)
}

// -------------------- UPDATE --------------------
type CustomerUpdatePayload struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Phone     string `json:"phone"`
	GenderID  uint   `json:"genderId"`
	Email     string `json:"email"`
}

func UpdateCustomer(c *gin.Context) {
	id := c.Param("id")
	var customer entity.Customer

	if err := config.DB.First(&customer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}

	var payload CustomerUpdatePayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	customer.FirstName = payload.FirstName
	customer.LastName = payload.LastName
	customer.PhoneNumber = payload.Phone
	customer.GenderID = payload.GenderID

	if err := config.DB.Save(&customer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Update email in User table if provided
	if payload.Email != "" {
		var user entity.User
		if err := config.DB.First(&user, customer.UserID).Error; err == nil {
			user.Email = payload.Email
			if err := config.DB.Save(&user).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update email: " + err.Error()})
				return
			}
		}
	}

	var updatedCustomer entity.Customer
	if err := config.DB.Preload("User").Preload("Gender").First(&updatedCustomer, customer.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Customer updated successfully",
		"data":    updatedCustomer,
	})
}

// -------------------- EDIT PROFILE CUSTOMER (สำหรับลูกค้าแก้ไขโปรไฟล์ตัวเอง) --------------------
type CustomerEditProfilePayload struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Phone     string `json:"phone"`
	GenderID  uint   `json:"genderId"`
}

func EditCustomerProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var payload CustomerEditProfilePayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var customer entity.Customer
	if err := config.DB.First(&customer, "user_id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}

	customer.FirstName = payload.FirstName
	customer.LastName = payload.LastName
	customer.PhoneNumber = payload.Phone
	customer.GenderID = payload.GenderID

	if err := config.DB.Save(&customer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var updatedCustomer entity.Customer
	config.DB.Preload("User").Preload("Gender").Preload("Addresses").First(&updatedCustomer, customer.ID)

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
		"data":    updatedCustomer,
	})
}

// -------------------- DELETE --------------------
func DeleteCustomer(c *gin.Context) {
	id := c.Param("id")
	var customer entity.Customer

	if err := config.DB.First(&customer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}

	if err := config.DB.Delete(&customer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Delete(&entity.User{}, customer.UserID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Customer deleted successfully"})
}
