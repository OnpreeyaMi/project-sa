package entity

import (
	"time"
	"gorm.io/gorm"
)

// history_complain.go
type HistoryComplain struct {
    gorm.Model
    StatusOld   string    `gorm:"column:status_old"`
    StatusNew   string    `gorm:"column:status_new"`
    Note        string    `gorm:"column:note"`
    ChangedDate time.Time `gorm:"column:changed_date"`

    ChangedBy uint     `gorm:"column:changed_by"`
    Employee  *Employee `gorm:"foreignKey:ChangedBy;references:ID"` // <-- เปลี่ยน references:ID

    ComplaintID uint
    Complaint   *Complaint `gorm:"foreignKey:ComplaintID;references:ID"`
}


