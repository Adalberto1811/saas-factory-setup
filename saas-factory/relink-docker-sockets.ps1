# 🐋 Script de Re-vinculación Maestra de Sockets Docker (v1.0)
# Proposito: Reparar el error npipe y permitir arranque headless de la fábrica.

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   RE-VINCULACIÓN DE SOCKETS DOCKER (Zero Mistakes)" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Limpieza total de procesos estancados
Write-Host "[1/5] Apagando subsistema Linux y servicios Docker..." -ForegroundColor Yellow
wsl --shutdown
Stop-Service -Name "com.docker.service" -ErrorAction SilentlyContinue

# 2. Eliminación de pipes huérfanos (si existen)
# Nota: Windows maneja npipe como archivos especiales.
Write-Host "[2/5] Limpiando contextos de Docker..." -ForegroundColor Yellow
docker context use default
docker context rm -f desktop-linux 2>$null

# 3. Reinicio forzado del servicio core
Write-Host "[3/5] Reiniciando servicio de Windows com.docker.service..." -ForegroundColor Yellow
Start-Service -Name "com.docker.service"
Start-Sleep -s 15 # Damos tiempo al motor para calentar

# 4. Forzar el puente WSL2 <-> Windows
Write-Host "[4/5] Inyectando bridge en distro docker-desktop..." -ForegroundColor Yellow
wsl -d docker-desktop -e /usr/bin/true

# 5. Verificación de conectividad
Write-Host "[5/5] Verificando salud de la ballena..." -ForegroundColor Yellow
$test = docker ps 2>&1
if ($test -match "CONTAINER ID") {
    Write-Host "====================================================" -ForegroundColor Green
    Write-Host "   ¡ÉXITO! La ballena está despierta y escuchando." -ForegroundColor Green
    Write-Host "====================================================" -ForegroundColor Green
} else {
    Write-Host "----------------------------------------------------" -ForegroundColor Red
    Write-Host "   ERROR: El socket sigue sin responder." -ForegroundColor Red
    Write-Host "   Intenta ejecutar este script como ADMINISTRADOR." -ForegroundColor Red
    Write-Host "----------------------------------------------------" -ForegroundColor Red
}
