package entity

import "gorm.io/gorm"

type Position struct {
	gorm.Model
	PositionName  string          `json:"PositionName"` // เช่น "พนักงานขนส่ง"

	Employee      []*Employee     `gorm:"foreignKey:PositionID" json:"-"`
	PositionCount *PositionCount  `gorm:"foreignKey:PositionID" json:"-"`
}
