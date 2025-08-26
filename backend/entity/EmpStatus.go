package entity


type EmpStatus struct {
StatusID uint `gorm:"primaryKey" json:"status_id"`
StatusName string `json:"status_name"`
StatusDescription string `json:"status_description"`
}