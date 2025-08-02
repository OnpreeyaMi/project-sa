package entity

import (
	"gorm.io/gorm"
	"time"
)

type History struct {
	gorm.Model
 	OrderID      uint
	BasketID     uint
	CustomerID   uint
	DetergentID  uint
	Payment_id 	 uint
	Process_id  uint
}
