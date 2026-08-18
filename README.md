# Simple School System (SSS) 🎓

A modern, highly-responsive School Management System featuring an **Admin Portal** and a **Student/Parent Portal**.

> [!IMPORTANT]
> **This project is under active development.** We are continuously rolling out new features and modules on a regular basis. Stay tuned for frequent updates! 🚀

## 🌟 Comprehensive System Modules

The system has been completely modernized from legacy PHP into a fully integrated Go+React application. Below is the overview of all available systems and their access levels:

| Category | Module / System | Description | Admin | Teacher | Student / Parent |
| :--- | :--- | :--- | :---: | :---: | :---: |
| 🌍 **Public** | **Online Admissions** | Public portal for new student registrations, document uploads, and application fee payments. | ✅ | ❌ | 🌐 (Public) |
| ⚙️ **Core** | **User Management** | Manage profiles, CSV Bulk Import/Export, and Mass Promotions (End-of-year grade shifting). | ✅ | ❌ | ❌ |
| 📚 **Academic** | **Attendance** | Track daily attendance, tardiness, and absences. | ✅ | ✅ | ✅ (View Only) |
| 📚 **Academic** | **Homework & Grading** | Assign, submit, and grade homework and class assignments. | ✅ | ✅ | ✅ |
| 📚 **Academic** | **Report Cards** | Generate and view end-of-term academic evaluations and detailed grades. | ✅ | ❌ | ✅ (View Only) |
| ⚖️ **Behavior** | **Conduct & Discipline** | Record positive/negative behavioral points and disciplinary actions. | ✅ | ✅ | ✅ (View Only) |
| 💸 **Finance** | **Invoices & Billing** | Generate fee invoices integrated with **PromptPay QR Code (EMVCo)** for seamless mobile banking payments. | ✅ | ❌ | ✅ |
| 🛒 **Commerce**| **School Shop** | Internal E-Commerce platform for ordering uniforms and stationeries with real-time stock deductions. | ✅ | ❌ | ✅ |
| 🛠️ **Support** | **Helpdesk Tickets** | Ticketing system for reporting maintenance issues or general inquiries to the administration. | ✅ | ✅ | ✅ |
| 🚌 **Logistics**| **School Bus** | Register for school transportation, selecting specific pickup and drop-off zones. | ✅ | ❌ | ✅ |
| ⚽ **Activities**| **ECAs & Clubs** | Enroll in Extracurricular Activities (ECAs) and summer support classes. | ✅ | ❌ | ✅ |
| 📖 **Facilities**| **E-Library** | Track book borrowing status and browse available digital/physical resources. | ✅ | ❌ | ✅ |
| 🏥 **Health** | **Infirmary & Health** | Log student illnesses, accidents, medical history, and specific health limitations. | ✅ | ✅ | ✅ (View Only) |
| ℹ️ **Resources**| **Information Hub** | Centralized knowledge base containing School Policies, Curriculum guides, and External Links. | ✅ | ❌ | ✅ |

## 💻 Technology Stack
- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Go (Fiber framework), GORM
- **Database:** SQLite (Easily migratable to PostgreSQL/MySQL via GORM)
- **Utilities:** Native Thai PromptPay QR Payload Generator

---

## 🚀 How to run locally

### Backend
```bash
cd backend
go mod download
go run cmd/api/main.go
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
