package entity

import (
	"time"
)
type AuditLog struct {
	LogID      uint      `gorm:"primaryKey;autoIncrement"`
	Action      string 
	Timestamp   time.Time
	   
	AdminID   	uint
	Admin  	User     `gorm:"foreignKey:AdminID;references:UserID"` 
}
	