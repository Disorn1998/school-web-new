# 🎓 Simple School System (SSS)

A modern, highly responsive, and full-featured **School Management System** designed to digitize and streamline administrative and academic workflows. 

The system provides dedicated portals for **Administrators, Teachers, Students, and Parents**, ensuring that every stakeholder has secure, real-time access to the information they need.

> [!IMPORTANT]
> **This project is a demonstration of a modernized architecture.** Originally a legacy PHP application, it has been completely re-engineered from the ground up using a modern **Go (Fiber) + React (Vite)** technology stack to showcase improved scalability, performance, and maintainability.

---

## 🚀 Live Demo Portfolio

Experience the system firsthand through our live deployment. The database resets automatically to provide a clean sandbox environment.

- **Frontend / UI:** Hosted on **Cloudflare Pages**
- **Backend API:** Hosted on **Render** (Auto-spins down when inactive; please allow 30-50 seconds for the initial wake-up).

👉 **[Try the Live Demo Here](https://school-web-new-daw.pages.dev/)**

> [!TIP]
> **No Registration Required!** 
> When visiting the login pages, simply click the **"⭐ Auto Fill Demo Login"** buttons to automatically populate the credentials and instantly access the pre-seeded dashboards.

---

## 🌟 Comprehensive System Modules

The system encapsulates all essential operations required to run a modern educational institution.

| Category | Module / System | Description | Admin | Teacher | Student / Parent |
| :--- | :--- | :--- | :---: | :---: | :---: |
| 🌍 **Public** | **Online Admissions** | Public portal for new student registrations, document uploads, and application fee payments. | ✅ | ❌ | 🌐 (Public) |
| ⚙️ **Core** | **User Management** | Complete lifecycle management: profiles, CSV Bulk Import/Export, and Mass Promotions (grade shifting). | ✅ | ❌ | ❌ |
| 📚 **Academic** | **Attendance Tracking** | Real-time tracking of daily attendance, tardiness, and absences with analytics. | ✅ | ✅ | ✅ (View) |
| 📚 **Academic** | **Homework & Grading** | End-to-end assignment workflow: creation, digital submission, and feedback/grading. | ✅ | ✅ | ✅ |
| 📚 **Academic** | **Report Cards** | Automated generation of end-of-term academic evaluations and GPA calculations. | ✅ | ❌ | ✅ (View) |
| ⚖️ **Behavior** | **Conduct & Discipline** | Transparent ledger for recording positive/negative behavioral points and disciplinary actions. | ✅ | ✅ | ✅ (View) |
| 💸 **Finance** | **Invoices & Billing** | Generate tuition invoices integrated with **PromptPay QR Code (EMVCo)** for seamless mobile banking. | ✅ | ❌ | ✅ |
| 🛒 **Commerce**| **School E-Shop** | Internal E-Commerce platform for uniform and stationery orders with real-time stock deductions. | ✅ | ❌ | ✅ |
| 🛠️ **Support** | **Helpdesk Tickets** | Centralized IT and maintenance ticketing system for reporting issues to the administration. | ✅ | ✅ | ✅ |
| 🚌 **Logistics**| **School Bus Router** | Register for school transportation, selecting specific pickup and drop-off geographic zones. | ✅ | ❌ | ✅ |
| ⚽ **Activities**| **ECAs & Clubs** | Self-service enrollment in Extracurricular Activities (ECAs) and summer support classes. | ✅ | ❌ | ✅ |
| 📖 **Facilities**| **Digital Library** | Catalog management, book borrowing tracking, and browsing of available physical resources. | ✅ | ❌ | ✅ |
| 🏥 **Health** | **Infirmary Logs** | Secure logging of student illnesses, accidents, medical history, and specific health limitations. | ✅ | ✅ | ✅ (View) |
| ℹ️ **Resources**| **Information Hub** | Centralized knowledge base containing School Policies, Curriculum guides, and External Links. | ✅ | ❌ | ✅ |

---

## 💻 Technology Stack

### Frontend Architecture
- **React 18** with **Vite** for lightning-fast HMR and optimized production builds.
- **Tailwind CSS** for highly responsive, utility-first styling.
- **Lucide React** for consistent, modern SVG iconography.
- **Axios** for robust API communication with JWT interceptors.

### Backend Architecture
- **Go 1.22+** compiled into a single, highly performant binary.
- **Fiber v2** (Express-inspired web framework for Go) for rapid routing and middleware management.
- **GORM** for Object-Relational Mapping and automatic schema migrations.
- **SQLite** database implementation (Designed to be effortlessly migratable to **PostgreSQL/MySQL** via GORM dialects).
- **Bcrypt & JWT (v5)** for secure, stateless authentication.
- **PromptPay QR Generator** for generating native Thai EMVCo QR payloads dynamically.

---

## 🛠️ Local Development Setup

To run this project on your local machine, ensure you have **Node.js** and **Go** installed.

### 1. Start the Backend API
The backend utilizes SQLite, so no complex database servers are required. The system will automatically migrate the database and seed it with demo data upon the first run.

```bash
cd backend
# Download Go dependencies
go mod download
# Run the Fiber server (Defaults to http://localhost:3000)
go run cmd/api/main.go
```

### 2. Start the Frontend Application
In a new terminal window:

```bash
cd frontend
# Install Node dependencies
npm install
# Start the Vite development server (Defaults to http://localhost:5173)
npm run dev
```

The frontend will automatically proxy API requests or utilize the fallback local URL. You can log in using the credentials seeded by the backend (e.g., Admin: `admin` / `password`).
