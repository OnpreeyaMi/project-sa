package controller

import (
	
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
	"math/rand"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/gin-gonic/gin"
	
)
const maxFilesPerComplaint = 5
const maxFileSizeBytes int64 = 10 * 1024 * 1024

// Remove these lines; logic for file size and count checks should be inside the CreateComplaint function.
func makePublicID() string {
		return fmt.Sprintf("CMP-%s-%06d",
			time.Now().Format("20060102-150405"),
			rand.Intn(1000000),
		)
}
func guessMimeByExt(name string) string { 	
	switch strings.ToLower(filepath.Ext(name)) { 	
		case ".png": return "image/png" 
		case ".jpg", ".jpeg": return "image/jpeg" 
		case ".webp": return "image/webp" 
		case ".pdf": return "application/pdf" 
		default: return "application/octet-stream" }
}
func sanitize(name string) string { 
	base := filepath.Base(name) 
	var b strings.Builder 
	for _, r := range base { 
		if (r >= 'a' && r <= 'z') || 
			(r >= 'A' && r <= 'Z') || 
			(r >= '0' && r <= '9') || 
			r == '.' || r == '_' || r == '-' { 
			b.WriteRune(r) 
		} else { 
			b.WriteRune('_') 
		} 
	} 
	out := b.String() 
	if out == "" { 
		out = fmt.Sprintf("file_%d", time.Now().UnixNano()) 
	}
	return out
}
// POST /complaints  (multipart/form-data)  // << สาธารณะ ไม่ต้อง Authorizes()
func CreateComplaint(c *gin.Context) {
	email := strings.TrimSpace(c.PostForm("email"))        // เก็บเป็นช่องทางติดต่อ
	title := strings.TrimSpace(c.PostForm("title"))
	desc  := strings.TrimSpace(c.PostForm("description"))
	orderIDStr := strings.TrimSpace(c.PostForm("orderId"))

	// validate ขั้นต่ำ
	if title == "" || desc == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรอกหัวข้อ และรายละเอียด ให้ครบถ้วน"})
		return
	}

	// --- แปลง orderId (optional) ---
	var orderIDPtr *uint
	if orderIDStr != "" {
		if v, err := strconv.ParseUint(orderIDStr, 10, 64); err == nil {
			u := uint(v)
			orderIDPtr = &u
		}
	}

	
	
	custIDStr := strings.TrimSpace(c.PostForm("customerId"))
	var customerIDPtr *uint
	if custIDStr != "" {
		if v, err := strconv.ParseUint(custIDStr, 10, 64); err == nil {
			u := uint(v)
			customerIDPtr = &u
		}
	}

	// --- เตรียม complaint ---
	pubID := makePublicID()
	comp := entity.Complaint{
		StatusComplaint: "รอดำเนินการ",
		Title:           title,
		Description:     desc,
		CreateDate:      time.Now(),
		Email:           email,     // เก็บเป็นช่องทางติดต่อ
		OrderID:         orderIDPtr,
		PublicID:        pubID,
	}
	// ตั้งค่า CustomerID เฉพาะเมื่อหาเจอจริง ๆ
	if customerIDPtr != nil { 
		comp.CustomerID = *customerIDPtr 
	}
	

	if err := config.DB.Create(&comp).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกคำร้องเรียนไม่สำเร็จ: " + err.Error()})
		return
	}

	// --- จัดการไฟล์แนบ (optional) ---
	form, _ := c.MultipartForm()
	if form != nil {
		files := form.File["attachments"]
		if len(files) > maxFilesPerComplaint {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("อัปโหลดได้ไม่เกิน %d ไฟล์", maxFilesPerComplaint)})
			return
		}

		baseDir := filepath.Join(".", "uploads", "complaints", pubID)
		if err := os.MkdirAll(baseDir, 0o755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "สร้างโฟลเดอร์อัปโหลดไม่สำเร็จ: " + err.Error()})
			return
		}

		for _, fh := range files {
			if fh.Size > maxFileSizeBytes {
				c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("ไฟล์ %s มีขนาดเกิน 10MB", fh.Filename)})
				return
			}

			safe := sanitize(fh.Filename)
			dstPath := filepath.Join(baseDir, safe)

			if err := c.SaveUploadedFile(fh, dstPath); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกไฟล์แนบไม่สำเร็จ: " + err.Error()})
				return
			}

			mime := guessMimeByExt(safe)
			att := entity.ComplaintAttachment{
				ComplaintID:  &comp.ID,
				OriginalName: fh.Filename,
				FileName:     safe,
				MimeType:     mime,
				SizeBytes:    fh.Size,
				Path:         dstPath,
				URL:          "/uploads/complaints/" + pubID + "/" + safe,
				UploadedAt:   time.Now(),
			}
			if err := config.DB.Create(&att).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกข้อมูลไฟล์แนบไม่สำเร็จ: " + err.Error()})
				return
			}
		}
	}

	
	// ส่งกลับ PublicID ให้หน้า UI
	c.JSON(http.StatusCreated, gin.H{"id": comp.PublicID})
}
