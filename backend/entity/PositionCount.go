package entity

import "gorm.io/gorm"

type PositionCount struct {
	gorm.Model
	TotalEmployee int      

	PositionID    uint      
	Position      *Position `gorm:"foreignKey:PositionID"`
}
