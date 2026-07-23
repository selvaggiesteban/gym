# GYM App — Push Script
# Ejecutar después de configurar el repo remoto manualmente

$REPO_URL = "https://github.com/selvaggiesteban/gym.git"

Write-Host "=== GYM App — Push Script ===" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "web\package.json") -or -not (Test-Path "api\package.json")) {
    Write-Host "ERROR: Ejecutar desde la raíz del proyecto gym/" -ForegroundColor Red
    exit 1
}

# Verificar git status
Write-Host "1. Verificando estado de git..." -ForegroundColor Yellow
git status

# Verificar remote
$remote = git remote get-url origin 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "2. No hay remote configurado. Configurando..." -ForegroundColor Yellow
    git remote add origin $REPO_URL
    Write-Host "   Remote agregado: $REPO_URL" -ForegroundColor Green
} else {
    Write-Host "   Remote: $remote" -ForegroundColor Green
}

# Verificar rama
$branch = git branch --show-current
Write-Host "   Rama actual: $branch" -ForegroundColor Green

# Push
Write-Host ""
Write-Host "3. Push a GitHub..." -ForegroundColor Yellow
git push -u origin $branch

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== Push exitoso! ===" -ForegroundColor Green
    Write-Host "Repo: https://github.com/selvaggiesteban/gym" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "=== Push falló. Verificar autenticación y permisos. ===" -ForegroundColor Red
    Write-Host "Pasos:" -ForegroundColor Yellow
    Write-Host "  1. Crear repo en https://github.com/new (name: gym, private)" -ForegroundColor Yellow
    Write-Host "  2. Ejecutar: gh auth login" -ForegroundColor Yellow
    Write-Host "  3. Volver a ejecutar este script" -ForegroundColor Yellow
}
