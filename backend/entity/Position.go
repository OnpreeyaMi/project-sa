package entity

import "gorm.io/gorm"



type Position struct {
	gorm.Model
	PositionName  string          // เช่น "พนักงานขนส่ง"

	Employee      []*Employee     `gorm:"foreignKey:PositionID"`
	PositionCount *PositionCount  `gorm:"foreignKey:PositionID"`
}
