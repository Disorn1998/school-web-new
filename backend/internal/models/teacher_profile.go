package models

// TeacherProfile represents the teacher_profile table in the database
type TeacherProfile struct {
	ID      int    `gorm:"primaryKey;column:id" json:"id"`
	AdminID int    `gorm:"column:admin_id;uniqueIndex" json:"admin_id"`
	Profile string `gorm:"column:profile;type:text" json:"profile"`
	
	// Optional relation if we want to fetch the Admin easily from the profile
	Admin   *Admin `gorm:"foreignKey:AdminID" json:"admin,omitempty"`
}

// TableName overrides the table name used by TeacherProfile to `teacher_profile`
func (TeacherProfile) TableName() string {
	return "teacher_profile"
}
