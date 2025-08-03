package entity

type EmpPosition struct {
	Position_id uint `gorm:"primaryKey;autoIncrement"`
	Position_name string
	
	Employee_id uint
	Employees []Employee `gorm:"foreignKey:Employee_id"`
}