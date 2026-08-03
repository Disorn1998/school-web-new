package models

// Year represents the years (classes) table in the database
type Year struct {
	ID       int    `gorm:"primaryKey;column:id" json:"id"`
	YearName string `gorm:"column:year_name" json:"year_name"`
}

// TableName overrides the table name used by Year to `years`
func (Year) TableName() string {
	return "years"
}

// Subject represents the subjects table
type Subject struct {
	ID          int    `gorm:"primaryKey;column:id" json:"id"`
	SubjectName string `gorm:"column:subject_name" json:"subject_name"`
}

// TableName overrides the table name used by Subject to `subjects`
func (Subject) TableName() string {
	return "subjects"
}
