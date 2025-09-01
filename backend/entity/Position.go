package entity
import (
	"gorm.io/gorm"
)

type Position struct {
	gorm.Model
	Position_name string

	
	Employee []*Employee `gorm:"foreignKey:PositionID"`
	
	PositionCount *PositionCount `gorm:"foreignKey:PositionID"`
}