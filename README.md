# Simple School System (SSS) 🎓

A modern, highly-responsive School Management System featuring an **Admin Portal** and a **Student/Parent Portal**.

> [!IMPORTANT]
> **This project is under active development.** We are continuously rolling out new features and modules on a regular basis. Stay tuned for frequent updates! 🚀

## Features
- **Admin Portal**: Manage students, parents, teachers, and staff.
- **Portals**: Dedicated dashboards for students and parents.
- **Identity Reorganization**: Seamless mapping of legacy sequential IDs to a modern database structure.
- **Modern UI**: Built with React, Vite, and Tailwind CSS.
- **Backend**: Blazing fast Go (Fiber) server with SQLite.

## How to run locally

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
