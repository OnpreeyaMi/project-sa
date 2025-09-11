package controller

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ---------- Helpers: Map สถานะ UI <-> DB (ไทย) ----------
func toUIStatus(thai string) string {
	switch strings.TrimSpace(thai) {
	case "กำลังดำเนินการ":
		return "in_progress"
	case "ปิดงานแล้ว":
		return "resolved"
	default:
		return "new" // ครอบคลุม "รอดำเนินการ" และค่าอื่น ให้แสดงเป็น new
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

// ป้องกัน NPE และทำชื่อเต็มลูกค้าแบบยืดหยุ่น
func fullCustomerName(c *entity.Customer) string {
	if c == nil {
		return ""
	}
	// ปรับตามโครงสร้างจริงของ Customer ที่คุณมี
	// ถ้ามี FirstName/LastName:
	type hasFN interface{ GetFirstName() string }
	type hasLN interface{ GetLastName() string }

	// ถ้าไม่มี method ก็ลอง field ที่พบบ่อย ๆ
	fn := ""
	ln := ""

	// ใช้ reflect ได้ แต่เพื่อความเบา: ลอง assert เป็น struct ปกติ
	// คุณสามารถแก้ให้ตรงกับ entity.Customer ของคุณได้ เช่น:
	// fn = c.FirstName
	// ln = c.LastName

	// เผื่อบางโปรเจกต์ใช้ Name เดียว:
	// if fn == "" && ln == "" && c.Name != "" { return c.Name }

	full := strings.TrimSpace(strings.TrimSpace(fn) + " " + strings.TrimSpace(ln))
	if full == "" {
		full = "ลูกค้า #" + strconv.Itoa(int(c.ID))
	}
	return full
}

// ---------- DTO ที่แม็ปกับหน้า UI ----------
type complaintRow struct {
	ID           string `json:"id"`                     // PublicID
	OrderRef     string `json:"orderId,omitempty"`      // "#854201" ถ้าต้องการ
	CustomerName string `json:"customerName"`           // จาก Customer
	Email        string `json:"email,omitempty"`
	Subject      string `json:"subject"`                // Title
	Message      string `json:"message"`                // Description
	CreatedAt    string `json:"createdAt"`              // ISO8601
	Status       string `json:"status"`                 // "new|in_progress|resolved"
	Priority     string `json:"priority"`               // ไม่มีใน DB -> ให้ "medium" ตามเหมาะสม
}

type replyItem struct {
	At string `json:"at"` // ISO8601
	By string `json:"by"`
	Text string `json:"text"`
}

// ---------- GET /employee/complaints ----------
func ListComplaintsForEmployee(c *gin.Context) {
	q := strings.TrimSpace(c.Query("q"))
	status := strings.TrimSpace(c.DefaultQuery("status", "all")) // all/new/in_progress/resolved
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "8"))
	if page < 1 { page = 1 }
	if pageSize < 1 || pageSize > 100 { pageSize = 8 }

	db := config.DB.Model(&entity.Complaint{}).Preload("Customer").Order("createdate DESC")

	if q != "" {
		like := "%" + q + "%"
		db = db.Where(
			config.DB.
				Where("public_id LIKE ?", like).
				Or("title LIKE ?", like).
				Or("description LIKE ?", like),
		)
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
			Email:        v.Email,
			Subject:      v.Title,
			Message:      v.Description,
			CreatedAt:    v.CreateDate.Format(time.RFC3339),
			Status:       toUIStatus(v.StatusComplaint),
			Priority:     "medium",
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"items": rows,
		"total": total,
		"page": page,
		"pageSize": pageSize,
	})
}

// ---------- GET /employee/complaints/:publicId ----------
func GetComplaintDetail(c *gin.Context) {
	publicId := strings.TrimSpace(c.Param("publicId"))
	if publicId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing publicId"})
		return
	}

	var comp entity.Complaint
	err := config.DB.
		Preload("Customer").
		Preload("Replies", func(tx *gorm.DB) *gorm.DB {
			return tx.Order("created_at DESC")
		}).
		Preload("Replies.Employee").
		First(&comp, "public_id = ?", publicId).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบคำร้องเรียน"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ดึงข้อมูลไม่สำเร็จ: " + err.Error()})
		}
		return
	}

	// แปลง replies -> history
	history := []replyItem{}
	for _, r := range comp.Replies {
		by := "พนักงาน #" + strconv.Itoa(int(r.EmpID))
		if r.Employee != nil {
			// ปรับตามฟิลด์จริง เช่น FirstName/LastName หรือ Name
			full := strings.TrimSpace(r.Employee.FirstName + " " + r.Employee.LastName)
			if full != "" { by = full }
		}
		history = append(history, replyItem{
			At:   r.CreateReplyDate.Format(time.RFC3339),
			By:   by,
			Text: r.Reply,
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
		"email":        comp.Email,
		"subject":      comp.Title,
		"message":      comp.Description,
		"createdAt":    comp.CreateDate.Format(time.RFC3339),
		"status":       toUIStatus(comp.StatusComplaint),
		"priority":     "medium",
		"history":      history,
	}
	c.JSON(http.StatusOK, out)
}

// ---------- POST /employee/complaints/:publicId/replies ----------
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

	// ตรวจสอบพนักงาน
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

	// อัปเดตสถานะ (optional)
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

// ---------- PATCH /employee/complaints/:publicId/status ----------
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

// ---------- GET /employee/complaints/:publicId/replies ----------
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
			if full != "" { by = full }
		}
		out = append(out, replyItem{
			At:   r.CreateReplyDate.Format(time.RFC3339),
			By:   by,
			Text: r.Reply,
		})
	}
	c.JSON(http.StatusOK, gin.H{"items": out})
}