# Setup Demo Environment
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  School Portal - Comprehensive Seed Data  " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Check if school.db exists
if (Test-Path "school.db") {
    Write-Host "Found existing school.db. Creating a backup..." -ForegroundColor Yellow
    Copy-Item -Path "school.db" -Destination "school.db.bak" -Force
}

$env:CGO_ENABLED="0"

Write-Host "`n[1/5] Running Main Application to AutoMigrate and Seed Core Data..." -ForegroundColor Green
Start-Process -FilePath "go" -ArgumentList "run cmd/api/main.go" -NoNewWindow
Start-Sleep -Seconds 5
# Stop the API so we can run independent seeders safely
$processes = Get-Process -Name "main" -ErrorAction SilentlyContinue
if ($processes) {
    Stop-Process -Name "main" -Force
}

Write-Host "`n[2/5] Seeding Phase 9, 10 (Library & Facilities)..." -ForegroundColor Green
go run seed_phase9.go
go run seed_library.go

Write-Host "`n[3/5] Seeding Phase 11 (Health & Evaluation)..." -ForegroundColor Green
go run seed_phase11.go

Write-Host "`n[4/5] Seeding Phase 12 & 13 (Lesson Plans & Support Classes)..." -ForegroundColor Green
go run seed_phase12.go
go run seed_phase13.go

Write-Host "`n[5/5] Seeding Phase 14 (Support Tickets)..." -ForegroundColor Green
go run seed_phase14.go

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "  ✅ ALL MOCK DATA SEEDED SUCCESSFULLY!    " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "You can now run 'go run cmd/api/main.go' to start the backend." -ForegroundColor Yellow
