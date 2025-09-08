package entity

import "gorm.io/gorm"

type DetergentUsageHistory struct {
	gorm.Model
	UserID    uint
	User      User
	DetergentID uint
	Detergent Detergent
	QuantityUsed int
	Reason     string
}