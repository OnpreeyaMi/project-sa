package controller

import (
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/gin-gonic/gin"
	"net/http"
)

func CreateEmployee(c *gin.Context) {
	var employee entity.Employee
	if err := c.ShouldBindJSON(&employee); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&employee).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, employee)
}
