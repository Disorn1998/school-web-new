package models

// Student represents the students table in the database
type Student struct {
	ID       int    `gorm:"primaryKey;column:id" json:"id"`
	ParentID int    `gorm:"column:parent_id" json:"parent_id"`
	YearID   int    `gorm:"column:year_id" json:"year_id"`
	Fullname string `gorm:"column:fullname" json:"fullname"`
	// Additional fields can be added here
}

// TableName overrides the table name used by Student to `students`
func (Student) TableName() string {
	return "students"
}
