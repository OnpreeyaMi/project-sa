package entity

import (
	"time"

	"gorm.io/gorm"
)
type AuditLog struct {
	gorm.Model
	//LogID      uint      `gorm:"primaryKey;autoIncrement"`
	Action      string 
	Timestamp   time.Time
	   
	AdminID   	uint
	Admin  	User     `gorm:"foreignKey:AdminID;references:ID"` 
}
	