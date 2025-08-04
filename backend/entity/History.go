package entity

type History struct {
	HistoryID    uint      `gorm:"primaryKey;autoIncrement"`

	OrderID      uint
	Order     Order     `gorm:"foreignKey:OrderID"`

	Basket    Basket    `gorm:"foreignKey:HistoryID"`

	LaundryProcesses []LaundryProcess `gorm:"foreignKey:HistoryID;references:HistoryID"`

	Payments []Payment `gorm:"foreignKey:HistoryID;references:HistoryID"`
}
