package entity

import (
	"time"
	"gorm.io/gorm"
)

type ComplaintAttachment struct {
	gorm.Model

	ComplaintID  *uint   `gorm:"index"`
	OriginalName string `gorm:"column:original_name"` // ชื่อไฟล์ตอนอัปโหลด
	FileName     string `gorm:"column:file_name"`     // ชื่อไฟล์ที่บันทึก (sanitize แล้ว)
	MimeType     string `gorm:"column:mime_type"`
	SizeBytes    int64  `gorm:"column:size_bytes"`
	Path         string `gorm:"column:path"`          // path ในเครื่อง เช่น ./uploads/complaints/CMP-.../xxx.png
	URL          string `gorm:"column:url"`           // เส้นทาง Static ที่ให้ front โหลด เช่น /uploads/complaints/CMP-.../xxx.png
	UploadedAt   time.Time `gorm:"column:uploaded_at"`
}
