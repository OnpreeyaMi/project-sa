package controller

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

/* ====================== Utilities ====================== */

var dateLayouts = []string{
	"2006-01-02",
	"2006-1-2",
	"02/01/2006",
	"2/1/2006",
	"02/01/06",
	"2006/01/02",
	"2006/1/2",
}

func parseDateThaiAware(s string) (time.Time, error) {
	s = strings.TrimSpace(s)
	if s == "" {
		return time.Time{}, errors.New("empty date")
	}
	if strings.Count(s, "/") == 2 {
		parts := strings.Split(s, "/")
		if len(parts) == 3 {
			if y, err := strconv.Atoi(parts[2]); err == nil && y >= 2400 {
				parts[2] = strconv.Itoa(y - 543)
				s = strings.Join(parts, "/")
			}
		}
	}
	var lastErr error
	for _, layout := range dateLayouts {
		if t, err := time.Parse(layout, s); err == nil {
			return t, nil
		} else {
			lastErr = err
		}
	}
	return time.Time{}, lastErr
}

func findOrCreatePosition(tx *gorm.DB, name string) (uint, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return 0, nil
	}
	var pos entity.Position
	if err := tx.Where("position_name = ?", name).First(&pos).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			pos = entity.Position{PositionName: name}
			if err := tx.Create(&pos).Error; err != nil {
				return 0, err
			}
		} else {
			return 0, err
		}
	}
	return pos.ID, nil
}

func modifyPositionCount(tx *gorm.DB, positionID uint, delta int) error {
	if positionID == 0 {
		return nil
	}
	var pc entity.PositionCount
	err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("position_id = ?", positionID).First(&pc).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			pc = entity.PositionCount{PositionID: positionID, TotalEmployee: 0}
			if err := tx.Create(&pc).Error; err != nil {
				return err
			}
		} else {
			return err
		}
	}
	return tx.Model(&entity.PositionCount{}).
		Where("position_id = ?", positionID).
		UpdateColumn("total_employee",
			gorm.Expr("CASE WHEN total_employee + ? < 0 THEN 0 ELSE total_employee + ? END", delta, delta),
		).Error
}

func defaultStatusDescription(name string) string {
	switch strings.ToLower(strings.TrimSpace(name)) {
	case "active":
		return "กำลังปฏิบัติงาน"
	case "inactive":
		return "ยังไม่ปฏิบัติงาน"
	case "onleave":
		return "ลาพัก"
	default:
		return ""
	}
}

func upsertEmployeeStatus(tx *gorm.DB, name, desc string) (uint, error) {
	name = strings.ToLower(strings.TrimSpace(name))
	desc = strings.TrimSpace(desc)
	if name == "" {
		return 0, nil
	}
	var st entity.EmployeeStatus
	err := tx.Where("status_name = ?", name).First(&st).Error
	switch {
	case errors.Is(err, gorm.ErrRecordNotFound):
		if desc == "" {
			desc = defaultStatusDescription(name)
		}
		st = entity.EmployeeStatus{StatusName: name, StatusDescription: desc}
		if err := tx.Create(&st).Error; err != nil {
			return 0, err
		}
		return st.ID, nil
	case err != nil:
		return 0, err
	default:
		if desc == "" {
			desc = defaultStatusDescription(name)
		}
		if st.StatusDescription != desc {
			if err := tx.Model(&st).Update("StatusDescription", desc).Error; err != nil {
				return 0, err
			}
		}
		return st.ID, nil
	}
}

// ---------- NEW: role utilities ----------
func getOrCreateRoleID(tx *gorm.DB, roleName string) (uint, error) {
	roleName = strings.TrimSpace(roleName)
	if roleName == "" {
		return 0, errors.New("empty role name")
	}
	var r entity.Role
	err := tx.Where("name = ?", roleName).First(&r).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		r = entity.Role{Name: roleName}
		if err := tx.Create(&r).Error; err != nil {
			return 0, err
		}
		return r.ID, nil
	}
	if err != nil {
		return 0, err
	}
	return r.ID, nil
}

/* ====================== DTO ====================== */

type EmployeePayload struct {
	Code              string
	FirstName         string
	LastName          string
	Gender            string
	Position          string
	PositionID        uint
	Phone             string
	Email             string
	Password          string
	JoinDate          string
	StartDate         string
	Status            string
	StatusDescription string
	UserID            uint
}

/* ====================== Handlers ====================== */

// POST /employees
func CreateEmployee(c *gin.Context) {
	var p EmployeePayload
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if strings.TrimSpace(p.Email) == "" || strings.TrimSpace(p.Password) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email and password are required"})
		return
	}

	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// position
	posID := p.PositionID
	if posID == 0 && strings.TrimSpace(p.Position) != "" {
		id, err := findOrCreatePosition(tx, p.Position)
		if err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		posID = id
	}

	// date
	jd := strings.TrimSpace(p.JoinDate)
	if jd == "" {
		jd = strings.TrimSpace(p.StartDate)
	}
	startTime, err := parseDateThaiAware(jd)
	if err != nil {
		tx.Rollback()
		c.JSON(400, gin.H{"error": "invalid join/start date"})
		return
	}

	// status + description
	if strings.TrimSpace(p.StatusDescription) == "" {
		p.StatusDescription = defaultStatusDescription(p.Status)
	}
	statusID, err := upsertEmployeeStatus(tx, p.Status, p.StatusDescription)
	if err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// --------- USER + ROLE = employee ----------
	// unique email check
	{
		var existed entity.User
		if err := tx.Where("email = ?", p.Email).First(&existed).Error; err == nil {
			tx.Rollback()
			c.JSON(http.StatusConflict, gin.H{"error": "email already exists"})
			return
		} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			tx.Rollback()
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
	}
	empRoleID, err := getOrCreateRoleID(tx, "employee")
	if err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "cannot ensure role: " + err.Error()})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(p.Password), bcrypt.DefaultCost)
	if err != nil { tx.Rollback(); c.JSON(500, gin.H{"error": "hash password failed"}); return }
	u := entity.User{Email: p.Email, Password: string(hashed)}
	if err := tx.Create(&u).Error; err != nil { tx.Rollback(); c.JSON(500, gin.H{"error": err.Error()}); return }

	// code unique check (optional)
	code := strings.TrimSpace(p.Code)
	if code != "" {
		var dup entity.Employee
		if err := tx.Where("code = ?", code).First(&dup).Error; err == nil {
			tx.Rollback()
			c.JSON(http.StatusConflict, gin.H{"error": "employeeCode already exists"})
			return
		} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			tx.Rollback()
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
	}

	emp := entity.Employee{
		Code:             code,
		FirstName:        p.FirstName,
		LastName:         p.LastName,
		Gender:           strings.ToLower(strings.TrimSpace(p.Gender)),
		Phone:            p.Phone,
		StartDate:        startTime,
		UserID:           u.ID,
		PositionID:       posID,
		EmployeeStatusID: statusID,
	}
	if err := tx.Create(&emp).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// gen code if empty
	if emp.Code == "" {
		gen := fmt.Sprintf("EMP%03d", emp.ID)
		if err := tx.Model(&entity.Employee{}).Where("id = ?", emp.ID).Update("code", gen).Error; err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		emp.Code = gen
	}

	// adjust position count
	if posID != 0 {
		if err := modifyPositionCount(tx, posID, 1); err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	var created entity.Employee
	if err := config.DB.Preload("User").Preload("Position").Preload("EmployeeStatus").
		First(&created, emp.ID).Error; err != nil {
		c.JSON(http.StatusCreated, gin.H{"id": emp.ID})
		return
	}
	c.JSON(http.StatusCreated, created)
}

// GET /employees/:id
func GetEmployee(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid id"})
		return
	}

	var emp entity.Employee
	if err := config.DB.Preload("User").Preload("Position").Preload("EmployeeStatus").
		First(&emp, uint(id)).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "employee not found"})
		} else {
			c.JSON(500, gin.H{"error": err.Error()})
		}
		return
	}
	c.JSON(200, emp)
}

// GET /employees
func ListEmployees(c *gin.Context) {
	var list []entity.Employee
	if err := config.DB.Preload("User").Preload("Position").Preload("EmployeeStatus").
		Find(&list).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, list)
}

// PUT /employees/:id
func UpdateEmployee(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid id"})
		return
	}

	var p EmployeePayload
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var e entity.Employee
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
		Preload("User").
		First(&e, uint(id)).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			tx.Rollback()
			c.JSON(404, gin.H{"error": "employee not found"})
		} else {
			tx.Rollback()
			c.JSON(500, gin.H{"error": err.Error()})
		}
		return
	}

	// code
	if code := strings.TrimSpace(p.Code); code != "" && code != e.Code {
		var dup entity.Employee
		if err := tx.Where("code = ?", code).First(&dup).Error; err == nil && dup.ID != e.ID {
			tx.Rollback()
			c.JSON(http.StatusConflict, gin.H{"error": "employeeCode already exists"})
			return
		} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			tx.Rollback()
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		e.Code = code
	}

	// position
	newPosID := p.PositionID
	if newPosID == 0 && strings.TrimSpace(p.Position) != "" {
		idp, err := findOrCreatePosition(tx, p.Position)
		if err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		newPosID = idp
	}
	oldPosID := e.PositionID

	// date
	jd := strings.TrimSpace(p.JoinDate)
	if jd == "" {
		jd = strings.TrimSpace(p.StartDate)
	}
	if jd != "" {
		t, err := parseDateThaiAware(jd)
		if err != nil {
			tx.Rollback()
			c.JSON(400, gin.H{"error": "invalid join/start date"})
			return
		}
		e.StartDate = t
	}

	// status
	if strings.TrimSpace(p.Status) != "" {
		if strings.TrimSpace(p.StatusDescription) == "" {
			p.StatusDescription = defaultStatusDescription(p.Status)
		}
		statusID, err := upsertEmployeeStatus(tx, p.Status, p.StatusDescription)
		if err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		e.EmployeeStatusID = statusID
	}

	// fields
	e.FirstName = p.FirstName
	e.LastName = p.LastName
	e.Gender = strings.ToLower(strings.TrimSpace(p.Gender))
	e.Phone = p.Phone
	e.PositionID = newPosID

	// user (email/password) + ensure role = employee เมื่อสร้างใหม่
	if e.UserID != 0 {
		var user entity.User
		if err := tx.First(&user, e.UserID).Error; err == nil {
			if strings.TrimSpace(p.Email) != "" && p.Email != user.Email {
				var exists entity.User
				if err := tx.Where("email = ?", p.Email).First(&exists).Error; err == nil && exists.ID != user.ID {
					tx.Rollback()
					c.JSON(409, gin.H{"error": "email already exists"})
					return
				}
				user.Email = p.Email
			}
			if strings.TrimSpace(p.Password) != "" {
				hashed, err := bcrypt.GenerateFromPassword([]byte(p.Password), bcrypt.DefaultCost)
				if err != nil {
					tx.Rollback()
					c.JSON(500, gin.H{"error": "hash password failed"})
					return
				}
				user.Password = string(hashed)
			}
			// ถ้า user ยังไม่มี role (กรณีข้อมูลเก่า) -> set เป็น employee
			if user.RoleID == 0 {
				empRoleID, err := getOrCreateRoleID(tx, "employee")
				if err != nil {
					tx.Rollback()
					c.JSON(500, gin.H{"error": "cannot ensure role: " + err.Error()})
					return
				}
				user.RoleID = empRoleID
			}
			if err := tx.Save(&user).Error; err != nil {
				tx.Rollback()
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
		}
	} else if strings.TrimSpace(p.Email) != "" {
		// สร้าง user ใหม่และผูก role = employee
		if strings.TrimSpace(p.Password) == "" {
			tx.Rollback()
			c.JSON(400, gin.H{"error": "password required to create user"})
			return
		}
		var exists entity.User
		if err := tx.Where("email = ?", p.Email).First(&exists).Error; err == nil {
			tx.Rollback()
			c.JSON(409, gin.H{"error": "email already exists"})
			return
		}
		empRoleID, err := getOrCreateRoleID(tx, "employee")
		if err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": "cannot ensure role: " + err.Error()})
			return
		}
		hashed, err := bcrypt.GenerateFromPassword([]byte(p.Password), bcrypt.DefaultCost)
		if err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": "hash password failed"})
			return
		}
		u := entity.User{Email: p.Email, Password: string(hashed), RoleID: empRoleID}
		if err := tx.Create(&u).Error; err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		e.UserID = u.ID
	}

	if err := tx.Save(&e).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// adjust position count
	if oldPosID != newPosID {
		if oldPosID != 0 {
			if err := modifyPositionCount(tx, oldPosID, -1); err != nil {
				tx.Rollback()
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
		}
		if newPosID != 0 {
			if err := modifyPositionCount(tx, newPosID, 1); err != nil {
				tx.Rollback()
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	var updated entity.Employee
	if err := config.DB.Preload("User").Preload("Position").Preload("EmployeeStatus").
		First(&updated, uint(id)).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, updated)
}

// DELETE /employees/:id
func DeleteEmployee(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid id"})
		return
	}

	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var emp entity.Employee
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
		First(&emp, uint(id)).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			tx.Rollback()
			c.Status(204)
		} else {
			tx.Rollback()
			c.JSON(500, gin.H{"error": err.Error()})
		}
		return
	}

	posID := emp.PositionID
	userID := emp.UserID

	if err := tx.Delete(&entity.Employee{}, uint(id)).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	// ลบ user ที่ผูก (คงพฤติกรรมเดิม)
	if userID != 0 {
		if err := tx.Delete(&entity.User{}, userID).Error; err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
	}
	if posID != 0 {
		if err := modifyPositionCount(tx, posID, -1); err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.Status(204)
}
