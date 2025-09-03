package entity

import "gorm.io/gorm"

type PositionCount struct {
	gorm.Model
	TotalEmployee int       `json:"totalEmployee"`

	PositionID    uint      `json:"positionID"`
	Position      *Position `gorm:"foreignKey:PositionID" json:"-"`
}
