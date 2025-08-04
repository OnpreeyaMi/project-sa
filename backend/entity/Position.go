package entity

type EmpPosition struct {
	PositionID uint `gorm:"primaryKey;autoIncrement"`
	Position_name string
	
	EmployeeID uint
	Employees []Employee `gorm:"foreignKey:EmployeeID"`
}