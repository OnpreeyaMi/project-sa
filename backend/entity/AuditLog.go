package entity

import (
	"time"
)
type AuditLog struct {
	Log_id      uint      `gorm:"primaryKey;autoIncrement"`
	Action      string 
	Timeslamp   time.Time   
	Admin_id   	uint
	//Admin      	Admin     `gorm:"foreignKey:Admin_id"` ไม่เห็นตาราง 
	//Target_user   uint
	//Target_user User      `gorm:"foreignKey:Target_user"`
}
	