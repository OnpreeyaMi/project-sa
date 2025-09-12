package controller

import (
	"errors"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

/*
แนวทาง:
- แยก endpoint ชัดเจน
  1) POST /complaints                     -> สร้างคำร้องเรียน (ไม่อัปโหลดไฟล์)
  2) POST /complaints/:publicId/attachments -> อัปโหลดไฟล์แนบทั้งหมดในคำขอเดียว
- ฝั่ง Frontend จะยิง 2 คำขอต่อเนื่องอัตโนมัติ (กดปุ่มครั้งเดียว)
*/

const (
	maxFilesPerComplaint = 5
	maxFileSizeBytes     = 10 * 1024 * 1024 // 10MB/ไฟล์
)

func init() {
	// กันความซ้ำของ rand.Intn
	rand.Seed(time.Now().UnixNano())
}

// ---------- Helpers ----------
func makePublicID() string {
	return fmt.Sprintf("CMP-%s-%06d", time.Now().Format("20060102-150405"), rand.Intn(1000000))
}

func guessMimeByExt(name string) string {
	switch strings.ToLower(filepath.Ext(name)) {
	case ".png":
		return "image/png"
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".webp":
		return "image/webp"
	case ".pdf":
		return "application/pdf"
	default:
		return "application/octet-stream"
	}
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

// ========== POST /complaints  (public; ไม่ต้อง Authorizes) ==========
// รับเฉพาะฟอร์มข้อมูล complaint (ไม่จัดการไฟล์แนบใน endpoint นี้)
func CreateComplaint(c *gin.Context) {
	email := strings.TrimSpace(c.PostForm("email")) // ช่องทางติดต่อ (optional)
	title := strings.TrimSpace(c.PostForm("title"))
	desc := strings.TrimSpace(c.PostForm("description"))
	orderIDStr := strings.TrimSpace(c.PostForm("orderId"))
	custIDStr := strings.TrimSpace(c.PostForm("customerId"))

	// validate ขั้นต่ำ
	if title == "" || desc == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรอกหัวข้อ และรายละเอียด ให้ครบถ้วน"})
		return
	}

	// parse orderID (optional)
	var orderIDPtr *uint
	if orderIDStr != "" {
		if v, err := strconv.ParseUint(orderIDStr, 10, 64); err == nil {
			u := uint(v)
			orderIDPtr = &u
		}
	}

	// parse customerID (optional แต่ปกติควรจะมี)
	var customerIDPtr *uint
	if custIDStr != "" {
		if v, err := strconv.ParseUint(custIDStr, 10, 64); err == nil {
			u := uint(v)
			customerIDPtr = &u
		}
	}

	// เตรียม complaint
	pubID := makePublicID()
	comp := entity.Complaint{
		StatusComplaint: "รอดำเนินการ",
		Title:           title,
		Description:     desc,
		CreateDate:      time.Now(),
		Email:           email,
		OrderID:         orderIDPtr,
		PublicID:        pubID,
	}
	if customerIDPtr != nil {
		comp.CustomerID = *customerIDPtr
	}

	// บันทึก
	if err := config.DB.Create(&comp).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกคำร้องเรียนไม่สำเร็จ: " + err.Error()})
		return
	}

	// ส่งกลับ publicId ให้ frontend เอาไปใช้กับ endpoint อัปโหลดไฟล์
	c.JSON(http.StatusCreated, gin.H{"id": comp.PublicID})
}

// ========== POST /complaints/:publicId/attachments  (public) ==========
// อัปโหลดไฟล์แนบทั้งหมดในคำขอเดียว
func AddComplaintAttachments(c *gin.Context) {
	publicID := strings.TrimSpace(c.Param("publicId"))
	if publicID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "publicId จำเป็น"})
		return
	}

	// 1) หา Complaint จาก PublicID
	var comp entity.Complaint
	if err := config.DB.Where("public_id = ?", publicID).First(&comp).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบคำร้องเรียนนี้"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ค้นหาคำร้องเรียนล้มเหลว: " + err.Error()})
		return
	}

	// 2) รับไฟล์จาก multipart
	form, _ := c.MultipartForm()
	if form == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาแนบไฟล์อย่างน้อย 1 ไฟล์ในฟิลด์ attachments"})
		return
	}
	files := form.File["attachments"]
	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่มีไฟล์ในฟิลด์ attachments"})
		return
	}

	// 3) ตรวจจำนวนไฟล์รวม (ของเดิม + ใหม่)
	var countExisting int64
	if err := config.DB.Model(&entity.ComplaintAttachment{}).
		Where("complaint_id = ?", comp.ID).
		Count(&countExisting).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ตรวจจำนวนไฟล์เดิมไม่สำเร็จ: " + err.Error()})
		return
	}
	if countExisting+int64(len(files)) > int64(maxFilesPerComplaint) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":           fmt.Sprintf("อัปโหลดได้สูงสุด %d ไฟล์ต่อคำร้องเรียน (เหลือได้อีก %d ไฟล์)", maxFilesPerComplaint, maxFilesPerComplaint-int(countExisting)),
			"alreadyUploaded": countExisting,
		})
		return
	}

	// 4) ตรวจนามสกุลที่อนุญาต
	allowed := map[string]bool{
		".png":  true,
		".jpg":  true,
		".jpeg": true,
		".webp": true,
		".pdf":  true,
	}

	// เตรียมโฟลเดอร์ปลายทาง
	baseDir := filepath.Join(".", "uploads", "complaints", publicID)
	if err := os.MkdirAll(baseDir, 0o755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "สร้างโฟลเดอร์อัปโหลดไม่สำเร็จ: " + err.Error()})
		return
	}

	type savedFile struct {
		Att entity.ComplaintAttachment
	}
	var saved []savedFile

	// ใช้ Transaction ชุดเดียว บันทึกเมตาดาต้าไฟล์ให้ครบ
	tx := config.DB.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เริ่มธุรกรรมไม่สำเร็จ: " + tx.Error.Error()})
		return
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดไม่คาดคิด"})
		}
	}()

	for _, fh := range files {
		if fh.Size > maxFileSizeBytes {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("ไฟล์ %s มีขนาดเกิน %d MB", fh.Filename, maxFileSizeBytes/(1024*1024))})
			return
		}

		ext := strings.ToLower(filepath.Ext(fh.Filename))
		if !allowed[ext] {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("ไม่รองรับชนิดไฟล์ %s (อนุญาต: .png .jpg .jpeg .webp .pdf)", ext)})
			return
		}

		// กันชื่อชน
		safe := sanitize(fh.Filename)
		dstPath := filepath.Join(baseDir, safe)
		if _, err := os.Stat(dstPath); err == nil {
			name := strings.TrimSuffix(safe, ext)
			safe = fmt.Sprintf("%s_%d%s", name, time.Now().UnixNano(), ext)
			dstPath = filepath.Join(baseDir, safe)
		}

		// บันทึกไฟล์จริงลงดิสก์
		if err := c.SaveUploadedFile(fh, dstPath); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกไฟล์แนบไม่สำเร็จ: " + err.Error()})
			return
		}

		mime := guessMimeByExt(safe)
		url := "/uploads/complaints/" + publicID + "/" + safe

		att := entity.ComplaintAttachment{
			ComplaintID:  &comp.ID,
			OriginalName: fh.Filename,
			FileName:     safe,
			MimeType:     mime,
			SizeBytes:    fh.Size,
			Path:         dstPath,
			URL:          url,
			UploadedAt:   time.Now(),
		}

		if err := tx.Create(&att).Error; err != nil {
			// หาก insert DB ไม่สำเร็จ ให้ลบไฟล์ที่เพิ่งเซฟ
			_ = os.Remove(dstPath)
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกข้อมูลไฟล์แนบไม่สำเร็จ: " + err.Error()})
			return
		}

		saved = append(saved, savedFile{Att: att})
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ยืนยันการบันทึกไม่สำเร็จ: " + err.Error()})
		return
	}

	// คืนผลไฟล์ที่บันทึกสำเร็จ
	out := make([]gin.H, 0, len(saved))
	for _, s := range saved {
		out = append(out, gin.H{
			"id":           s.Att.ID,
			"originalName": s.Att.OriginalName,
			"fileName":     s.Att.FileName,
			"mimeType":     s.Att.MimeType,
			"sizeBytes":    s.Att.SizeBytes,
			"url":          s.Att.URL,
			"uploadedAt":   s.Att.UploadedAt,
		})
	}

	c.JSON(http.StatusCreated, gin.H{
		"publicId":    publicID,
		"attachments": out,
	})
}
