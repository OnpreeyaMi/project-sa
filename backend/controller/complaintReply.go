package controller

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ======================================================
// Helpers: Map สถานะ UI <-> DB (ไทย)
// ======================================================

func toUIStatus(thai string) string {
	switch strings.TrimSpace(thai) {
	case "กำลังดำเนินการ":
		return "in_progress"
	case "ปิดงานแล้ว":
		return "resolved"
	default:
		return "new"
	}
}

func fromUIStatus(ui string) string {
	switch strings.TrimSpace(ui) {
	case "in_progress":
		return "กำลังดำเนินการ"
	case "resolved":
		return "ปิดงานแล้ว"
	default:
		return "รอดำเนินการ"
	}
}

// ======================================================
// Helper: สร้าง base URL แบบปลอดภัย (รองรับ proxy/HTTPS)
// - ใช้ X-Forwarded-Proto ถ้ามี (เช่นหลัง Nginx/Cloud proxy)
// - otherwise ดูจาก TLS
// ======================================================

func absoluteBaseURL(c *gin.Context) string {
	scheme := c.Request.Header.Get("X-Forwarded-Proto")
	if scheme == "" {
		if c.Request.TLS != nil {
			scheme = "https"
		} else {
			scheme = "http"
		}
	}
	host := c.Request.Host // เช่น "localhost:8000" หรือ "api.example.com"
	return fmt.Sprintf("%s://%s", scheme, host)
}

// ======================================================
// Helper: ชื่อเต็มลูกค้า (FirstName/LastName -> PhoneNumber -> #ID)
// ======================================================

func fullCustomerName(cus *entity.Customer) string {
	if cus == nil {
		return ""
	}
	fn := strings.TrimSpace(cus.FirstName)
	ln := strings.TrimSpace(cus.LastName)
	name := strings.TrimSpace(fn + " " + ln)
	if name == "" && strings.TrimSpace(cus.PhoneNumber) != "" {
		name = strings.TrimSpace(cus.PhoneNumber)
	}
	if name == "" {
		name = fmt.Sprintf("ลูกค้า #%d", cus.ID)
	}
	return name
}

// ======================================================
// DTOs
// ======================================================

type complaintRow struct {
	ID           string `json:"id"`                // PublicID
	OrderRef     string `json:"orderId,omitempty"` // เช่น "#123"
	CustomerName string `json:"customerName"`
	Subject      string `json:"subject"`   // Title
	Message      string `json:"message"`   // Description
	CreatedAt    string `json:"createdAt"` // ISO8601
	Status       string `json:"status"`    // new|in_progress|resolved
}

type replyItem struct {
	At   string `json:"at"`   // ISO8601
	By   string `json:"by"`   // ชื่อพนักงาน
	Text string `json:"text"` // เนื้อหาตอบกลับ
}

type attachmentItem struct {
	URL  string `json:"url"`           // ABSOLUTE URL -> http(s)://host/uploads/complaints/<PublicID>/<FileName>
	Name string `json:"name"`          // FileName
	Mime string `json:"mime,omitempty"`
	Size int64  `json:"size,omitempty"`
}

// ======================================================
// GET /employee/complaints
// ======================================================

func ListComplaintsForEmployee(c *gin.Context) {
	q := strings.TrimSpace(c.Query("q"))
	status := strings.TrimSpace(c.DefaultQuery("status", "all")) // all | new | in_progress | resolved
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "8"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 8
	}

	db := config.DB.Model(&entity.Complaint{}).
		Preload("Customer").
		Order("createdate DESC")

	if q != "" {
		like := "%" + q + "%"
		db = db.Joins("LEFT JOIN customers ON customers.id = complaints.customer_id").
			Where("(complaints.public_id LIKE ? OR complaints.title LIKE ? OR complaints.description LIKE ? OR "+
				"customers.first_name LIKE ? OR customers.last_name LIKE ? OR customers.phone_number LIKE ?)",
				like, like, like, like, like, like)
	}

	if status != "" && status != "all" {
		db = db.Where("status_complaint = ?", fromUIStatus(status))
	}

	var total int64
	if err := db.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถนับจำนวนรายการได้: " + err.Error()})
		return
	}

	var comps []entity.Complaint
	if err := db.Offset((page-1)*pageSize).Limit(pageSize).Find(&comps).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ดึงรายการคำร้องเรียนไม่สำเร็จ: " + err.Error()})
		return
	}

	rows := make([]complaintRow, 0, len(comps))
	for _, v := range comps {
		var orderRef string
		if v.OrderID != nil {
			orderRef = "#" + strconv.Itoa(int(*v.OrderID))
		}
		rows = append(rows, complaintRow{
			ID:           v.PublicID,
			OrderRef:     orderRef,
			CustomerName: fullCustomerName(v.Customer),
			Subject:      v.Title,
			Message:      v.Description,
			CreatedAt:    v.CreateDate.Format(time.RFC3339),
			Status:       toUIStatus(v.StatusComplaint),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"items":    rows,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

// ======================================================
// GET /employee/complaints/:publicId
// - รายละเอียด + replies + attachments (absolute URL)
// ======================================================

func GetComplaintDetail(c *gin.Context) {
	publicId := strings.TrimSpace(c.Param("publicId"))
	if publicId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing publicId"})
		return
	}

	var comp entity.Complaint
	err := config.DB.
		Preload("Customer").
		Preload("Replies", func(tx *gorm.DB) *gorm.DB { return tx.Order("created_at DESC") }).
		Preload("Replies.Employee").
		Preload("Attachments").
		First(&comp, "public_id = ?", publicId).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบคำร้องเรียน"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ดึงข้อมูลไม่สำเร็จ: " + err.Error()})
		}
		return
	}

	// replies
	history := make([]replyItem, 0, len(comp.Replies))
	for _, r := range comp.Replies {
		by := "พนักงาน #" + strconv.Itoa(int(r.EmpID))
		if r.Employee != nil {
			full := strings.TrimSpace(r.Employee.FirstName + " " + r.Employee.LastName)
			if full != "" {
				by = full
			}
		}
		history = append(history, replyItem{
			At:   r.CreateReplyDate.Format(time.RFC3339),
			By:   by,
			Text: r.Reply,
		})
	}

	// attachments -> absolute URL
	base := absoluteBaseURL(c)
	atts := make([]attachmentItem, 0, len(comp.Attachments))
	for _, a := range comp.Attachments {
		u := fmt.Sprintf("%s/uploads/complaints/%s/%s", base, comp.PublicID, a.FileName)
		atts = append(atts, attachmentItem{
			URL:  u,
			Name: a.FileName,
			Mime: strings.TrimSpace(a.MimeType),
			Size: a.SizeBytes,
		})
	}

	var orderRef string
	if comp.OrderID != nil {
		orderRef = "#" + strconv.Itoa(int(*comp.OrderID))
	}

	out := gin.H{
		"id":           comp.PublicID,
		"orderId":      orderRef,
		"customerName": fullCustomerName(comp.Customer),
		"subject":      comp.Title,
		"message":      comp.Description,
		"createdAt":    comp.CreateDate.Format(time.RFC3339),
		"status":       toUIStatus(comp.StatusComplaint),
		"history":      history,
		"attachments":  atts,
	}
	c.JSON(http.StatusOK, out)
}

// ======================================================
// GET /employee/complaints/:publicId/attachments
// - ดึงเฉพาะรายการไฟล์แนบ (absolute URL)
// ======================================================

func ListComplaintAttachments(c *gin.Context) {
	publicId := strings.TrimSpace(c.Param("publicId"))

	var comp entity.Complaint
	if err := config.DB.First(&comp, "public_id = ?", publicId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบคำร้องเรียน"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ค้นหาคำร้องเรียนไม่สำเร็จ: " + err.Error()})
		}
		return
	}

	var raw []entity.ComplaintAttachment
	if err := config.DB.Where("complaint_id = ?", comp.ID).Order("created_at DESC").Find(&raw).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ดึงไฟล์แนบไม่สำเร็จ: " + err.Error()})
		return
	}

	base := absoluteBaseURL(c)
	items := make([]attachmentItem, 0, len(raw))
	for _, a := range raw {
		u := fmt.Sprintf("%s/uploads/complaints/%s/%s", base, comp.PublicID, a.FileName)
		items = append(items, attachmentItem{
			URL:  u,
			Name: a.FileName,
			Mime: strings.TrimSpace(a.MimeType),
			Size: a.SizeBytes,
		})
	}
	c.JSON(http.StatusOK, gin.H{"items": items})
}

// ======================================================
// POST /employee/complaints/:publicId/replies
// ======================================================

type addReplyIn struct {
	EmpID     uint    `json:"empId"     binding:"required"`
	Text      string  `json:"text"      binding:"required"`
	NewStatus *string `json:"newStatus"` // optional: "new|in_progress|resolved"
}

func AddReplyToComplaint(c *gin.Context) {
	publicId := strings.TrimSpace(c.Param("publicId"))

	var in addReplyIn
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if strings.TrimSpace(in.Text) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณากรอกข้อความตอบกลับ"})
		return
	}

	var comp entity.Complaint
	if err := config.DB.First(&comp, "public_id = ?", publicId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบคำร้องเรียน"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ค้นหาคำร้องเรียนไม่สำเร็จ: " + err.Error()})
		}
		return
	}

	var emp entity.Employee
	if err := config.DB.First(&emp, in.EmpID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusBadRequest, gin.H{"error": "empId ไม่ถูกต้อง"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ตรวจสอบพนักงานไม่สำเร็จ: " + err.Error()})
		}
		return
	}

	rep := entity.ReplyComplaint{
		CreateReplyDate: time.Now(),
		Reply:           in.Text,
		EmpID:           in.EmpID,
		ComplaintID:     comp.ID,
	}
	if err := config.DB.Create(&rep).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกการตอบกลับไม่สำเร็จ: " + err.Error()})
		return
	}

	if in.NewStatus != nil {
		if err := config.DB.Model(&comp).
			Update("status_complaint", fromUIStatus(*in.NewStatus)).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "อัปเดตสถานะไม่สำเร็จ: " + err.Error()})
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"ok": true,
		"reply": gin.H{
			"at":   rep.CreateReplyDate.Format(time.RFC3339),
			"by":   strings.TrimSpace(emp.FirstName + " " + emp.LastName),
			"text": rep.Reply,
		},
	})
}

// ======================================================
// PATCH /employee/complaints/:publicId/status
// ======================================================

type setStatusIn struct {
	Status string `json:"status" binding:"required"` // new|in_progress|resolved
}

func SetComplaintStatus(c *gin.Context) {
	publicId := strings.TrimSpace(c.Param("publicId"))

	var in setStatusIn
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	val := strings.TrimSpace(in.Status)
	if val == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุสถานะ"})
		return
	}

	if err := config.DB.Model(&entity.Complaint{}).
		Where("public_id = ?", publicId).
		Update("status_complaint", fromUIStatus(val)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เปลี่ยนสถานะไม่สำเร็จ: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// ======================================================
// GET /employee/complaints/:publicId/replies
// ======================================================

func ListReplies(c *gin.Context) {
	publicId := strings.TrimSpace(c.Param("publicId"))

	var comp entity.Complaint
	if err := config.DB.First(&comp, "public_id = ?", publicId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบคำร้องเรียน"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ค้นหาคำร้องเรียนไม่สำเร็จ: " + err.Error()})
		}
		return
	}

	var reps []entity.ReplyComplaint
	if err := config.DB.
		Preload("Employee").
		Where("complaint_id = ?", comp.ID).
		Order("created_at DESC").
		Find(&reps).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ดึงประวัติการตอบกลับไม่สำเร็จ: " + err.Error()})
		return
	}

	out := make([]replyItem, 0, len(reps))
	for _, r := range reps {
		by := "พนักงาน #" + strconv.Itoa(int(r.EmpID))
		if r.Employee != nil {
			full := strings.TrimSpace(r.Employee.FirstName + " " + r.Employee.LastName)
			if full != "" {
				by = full
			}
		}
		out = append(out, replyItem{
			At:   r.CreateReplyDate.Format(time.RFC3339),
			By:   by,
			Text: r.Reply,
		})
	}
	c.JSON(http.StatusOK, gin.H{"items": out})
}
