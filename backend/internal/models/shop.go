package models

import (
	"time"

	"gorm.io/gorm"
)

type ShopCategory struct {
	ID           int            `gorm:"primaryKey;column:id" json:"id"`
	CategoryName string         `gorm:"column:category_name;unique;not null" json:"category_name"`
	CreatedAt    time.Time      `gorm:"column:created_at" json:"created_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

func (ShopCategory) TableName() string {
	return "shop_categories"
}

type ShopItem struct {
	ID          int            `gorm:"primaryKey;column:id" json:"id"`
	CategoryID  int            `gorm:"column:category_id" json:"category_id"`
	Name        string         `gorm:"column:name;not null" json:"name"`
	Description string         `gorm:"column:description" json:"description"`
	Price       float64        `gorm:"column:price;not null" json:"price"`
	StockQty    int            `gorm:"column:stock_qty;default:0" json:"stock_qty"`
	ImageURL    string         `gorm:"column:image_url" json:"image_url"`
	Category    *ShopCategory  `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	CreatedAt   time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (ShopItem) TableName() string {
	return "shop_items"
}

type ShopOrder struct {
	ID        int            `gorm:"primaryKey;column:id" json:"id"`
	OrderNo   string         `gorm:"column:order_no;unique;not null" json:"order_no"`
	StudentID int            `gorm:"column:student_id;not null" json:"student_id"`
	Total     float64        `gorm:"column:total;not null" json:"total"`
	Status    string         `gorm:"column:status;default:'Pending Payment'" json:"status"` // 'Pending Payment', 'Paid', 'Delivered'
	Items     []ShopOrderItem `gorm:"foreignKey:OrderID" json:"items,omitempty"`
	Student   *Student       `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	CreatedAt time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (ShopOrder) TableName() string {
	return "shop_orders"
}

type ShopOrderItem struct {
	ID        int      `gorm:"primaryKey;column:id" json:"id"`
	OrderID   int      `gorm:"column:order_id;not null" json:"order_id"`
	ItemID    int      `gorm:"column:item_id;not null" json:"item_id"`
	Quantity  int      `gorm:"column:quantity;not null" json:"quantity"`
	Price     float64  `gorm:"column:price;not null" json:"price"`
	Item      *ShopItem `gorm:"foreignKey:ItemID" json:"item,omitempty"`
}

func (ShopOrderItem) TableName() string {
	return "shop_order_items"
}
