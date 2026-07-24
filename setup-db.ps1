# Run this script after Docker is installed and running
# Usage: .\setup-db.ps1

Write-Host "Starting MySQL container..." -ForegroundColor Cyan
docker compose up -d mysql

Write-Host "Waiting for MySQL to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host "Running Prisma migrations..." -ForegroundColor Cyan
cd api
& "C:\Users\Esteban Selvaggi\AppData\Roaming\npm\pnpm.cmd" prisma migrate deploy

Write-Host "Generating Prisma client..." -ForegroundColor Cyan
& "C:\Users\Esteban Selvaggi\AppData\Roaming\npm\pnpm.cmd" prisma generate

Write-Host "Seeding database..." -ForegroundColor Cyan
& "C:\Users\Esteban Selvaggi\AppData\Roaming\npm\pnpm.cmd" prisma db seed

Write-Host "Done! Database is ready." -ForegroundColor Green
