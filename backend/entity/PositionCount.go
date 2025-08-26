package entity
import (
	"gorm.io/gorm"
)

type PositionCount struct {
	gorm.Model
	PositionCount_ID    uint `gorm:"primaryKey" json:"position_count_id"`
	TotalEmployee      int 

	Position_ID         uint 
	EmpPosition []EmpPosition `gorm:"foreignKey:Position_ID"`
}