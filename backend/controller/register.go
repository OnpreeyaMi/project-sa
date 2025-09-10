// controller/auth.go
package controller

import (
	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type RegisterInput struct {
	FirstName     string  `json:"firstName"`
	LastName      string  `json:"lastName"`
	Email         string  `json:"email"`
	Password      string  `json:"password"`
	PhoneNumber   string  `json:"phoneNumber"`
	GenderID      uint    `json:"genderId"`
	AddressDetail string  `json:"addressDetail"`
	Latitude      float64 `json:"latitude"`
	Longitude     float64 `json:"longitude"`
}

func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// hash password
	hashed, _ := bcrypt.GenerateFromPassword([]byte(input.Password), 12)

	// create user
	user := entity.User{
		Email:    input.Email,
		Password: string(hashed),
		RoleID:   2, // default role = customer
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already used"})
		return
	}

	// create customer
	customer := entity.Customer{
		FirstName:   input.FirstName,
		LastName:    input.LastName,
		PhoneNumber: input.PhoneNumber,
		IsVerified:  false,
		GenderID:    input.GenderID,
		UserID:      user.ID,
	}
	config.DB.Create(&customer)

	// create address
	address := entity.Address{
		CustomerID: customer.ID,
		AddressDetails:     input.AddressDetail,
		Latitude:   input.Latitude,
		Longitude:  input.Longitude,
		IsDefault:  true,
	}
	config.DB.Create(&address)

	c.JSON(http.StatusOK, gin.H{"message": "register success"})
}