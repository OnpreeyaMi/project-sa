package entity

import (
	"time"
)
type AuditLog struct {
	LogID      uint      `gorm:"primaryKey;autoIncrement"`
	Action      string 
	Timeslamp   time.Time   
	AdminID   	uint
	//Admin      	Admin     `gorm:"foreignKey:Admin_id"` ไม่เห็นตาราง 
	//Target_user   uint
	//Target_user User      `gorm:"foreignKey:Target_user"`
}
	