package entity

import ("time"
	"gorm.io/gorm"
)

type Queue struct {
	gorm.Model
	// QueueID uint `gorm:"primaryKey;autoIncrement"`
	Updated_at time.Time
	Created_at time.Time
	Queue_type string
	Status string

	Employee *Employee `gorm:"foreignKey:QueueID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	OrderID uint
	Order *Order `gorm:"foreignKey:OrderID"`

	TimeslotID uint
	TimeSlots []Timeslot `gorm:"foreignKey:QueueID;references:ID"`

	Queuehistory []Queuehistory `gorm:"foreignKey:QueueID;references:ID"`

	QueueAssignments []QueueAssignment `gorm:"foreignKey:QueueID;references:ID"`
}