package controller

import (
	"net/http"
	"strconv"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/gin-gonic/gin"
)

// -------------------- CREATE --------------------
type AddressPayload struct {
	AddressDetails string  `json:"AddressDetails" binding:"required"`
<<<<<<< HEAD
	Latitude    float64 `json:"Latitude" binding:"required"`
	Longitude    float64 `json:"Longitude" binding:"required"`
=======
	Latitude       float64 `json:"Latitude" binding:"required"`
	Longitude      float64 `json:"Longitude" binding:"required"`
>>>>>>> e041411a08e6d15d3a09f09f177d01f184310261
}

func CreateAddress(c *gin.Context) {
	userIDRaw, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDRaw.(uint)

	var payload AddressPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	address := entity.Address{
<<<<<<< HEAD
		CustomerID: userID,
		AddressDetails:     payload.AddressDetails,
		Latitude:        payload.Latitude,
		Longitude:        payload.Longitude,
		IsDefault:       false,
=======
		CustomerID:     userID,
		AddressDetails: payload.AddressDetails,
		Latitude:       payload.Latitude,
		Longitude:      payload.Longitude,
		IsDefault:      false,
>>>>>>> e041411a08e6d15d3a09f09f177d01f184310261
	}

	if err := config.DB.Create(&address).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, address)
}

// -------------------- UPDATE --------------------
func UpdateAddress(c *gin.Context) {
	id := c.Param("id")
	addressID, _ := strconv.Atoi(id)

	var payload AddressPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var address entity.Address
	if err := config.DB.First(&address, addressID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Address not found"})
		return
	}

	address.AddressDetails = payload.AddressDetails
	address.Latitude = payload.Latitude
	address.Longitude = payload.Longitude

	if err := config.DB.Save(&address).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, address)
}

// -------------------- SET MAIN --------------------
func SetMainAddress(c *gin.Context) {
	id := c.Param("id")
	addressID, _ := strconv.Atoi(id)

	var address entity.Address
	if err := config.DB.First(&address, addressID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Address not found"})
		return
	}

	// Reset main ของลูกค้าคนนี้ก่อน
	config.DB.Model(&entity.Address{}).
		Where("customer_id = ?", address.CustomerID).
		Update("is_default", false)

	// ตั้งค่าที่เลือกเป็น main
	address.IsDefault = true
	if err := config.DB.Save(&address).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Set as main address successfully"})
}

// -------------------- DELETE --------------------
func DeleteAddress(c *gin.Context) {
	id := c.Param("id")
	addressID, _ := strconv.Atoi(id)

	var address entity.Address
	if err := config.DB.First(&address, addressID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Address not found"})
		return
	}

	if err := config.DB.Delete(&address).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Address deleted successfully"})
}
