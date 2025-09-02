package entity

import (
	"gorm.io/gorm" ; 
)

type Gender struct {
	gorm.Model
	Name	string	`gorm:"unique;not null" json:"name"`

	Customers []*Customer `gorm:"foreignKey:GenderID"`
}