<#
.SYNOPSIS
    INSTALADOR-INTEGRAL.ps1 - Fabrica SaaS Ultra v2.3 (Fixed)
#>

$Host.UI.RawUI.BackgroundColor = "Black"
$Host.UI.RawUI.ForegroundColor = "Green"
Clear-Host

function Show-FactoryBanner {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Yellow
    Write-Host "        FABRICA SAAS - INSTALADOR INTEGRAL v2.3" -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Yellow
    Write-Host "   AgentSyn | MarketSyn | TranscripSyn | SynCards" -ForegroundColor Gray
    Write-Host "   VoiceSyn | SocialSyn | OCR-Facturas | Cotizador" -ForegroundColor Gray
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host ""
}

function Show-MainMenu {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "                    MENU PRINCIPAL" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  [N] Nuevo Cliente SaaS Completo" -ForegroundColor White
    Write-Host "  [E] Editar Proyecto Existente" -ForegroundColor White
    Write-Host "  [W] Configurar Webhooks N8N" -ForegroundColor White
    Write-Host "  [L] Listar Proyectos" -ForegroundColor White
    Write-Host "  [S] Iniciar Fabrica (npm run dev)" -ForegroundColor Yellow
    Write-Host "  ----------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  [B] Build Local (npm run build)" -ForegroundColor Magenta
    Write-Host "  [V] Build + Verificar" -ForegroundColor Magenta
    Write-Host "  [D] Deploy Automático (Git Push)" -ForegroundColor Magenta
    Write-Host "  [M] Deploy Manual (Seleccionar Proyecto)" -ForegroundColor Magenta
    Write-Host "  ----------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  [G] Guardar y Push a Git" -ForegroundColor Green
    Write-Host "  [I] SaaS Guardian (Brain/Insights) - [A] Orquestar (A2A)
    Write-Host "  ----------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  [T] Crear Tenant PWA (Multi-Tenant)" -ForegroundColor Blue
    Write-Host "  [U] Crear Usuario Admin (Neon DB)" -ForegroundColor Cyan
    Write-Host "  [Y] Deploy Landing Synergos (synergosia.online)" -ForegroundColor Yellow
    Write-Host "  [X] Salir" -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Selecciona una opcion: " -NoNewline -ForegroundColor Yellow
}

function Get-InputWithDefault {
    param([string]$Prompt, [string]$Default, [string]$Color = "White")
    Write-Host ""
    Write-Host "$Prompt" -ForegroundColor $Color
    if ($Default) {
        Write-Host "   (Actual: $Default)" -ForegroundColor DarkGray
    }
    Write-Host "   > " -NoNewline -ForegroundColor Yellow
    $input = Read-Host
    if ([string]::IsNullOrWhiteSpace($input)) { return $Default }
    return $input
}

function Get-ColorInput {
    param([string]$ColorName, [string]$Default, [string]$Description)
    Write-Host ""
    Write-Host "$ColorName" -ForegroundColor Magenta
    Write-Host "   $Description" -ForegroundColor DarkGray
    Write-Host "   (Actual: $Default)" -ForegroundColor DarkGray
    Write-Host "   > " -NoNewline -ForegroundColor Yellow
    $input = Read-Host
    if ([string]::IsNullOrWhiteSpace($input)) { return $Default }
    if ($input -notmatch '^#[0-9A-Fa-f]{6}$') {
        Write-Host "   Formato invalido. Usando: $Default" -ForegroundColor Yellow
        return $Default
    }
    return $input
}

function Select-Package {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Magenta
    Write-Host "              SELECCIONA EL PAQUETE" -ForegroundColor Magenta
    Write-Host "============================================================" -ForegroundColor Magenta
    Write-Host "  [1] BASICO        - Chatbot Generico" -ForegroundColor White
    Write-Host "  [2] PROFESIONAL   - AgentSyn (RAG + Documentos)" -ForegroundColor White
    Write-Host "  [3] AVANZADO      - + TranscripSyn + OCR" -ForegroundColor Yellow
    Write-Host "  [4] MARKETING     - + MarketSyn + SocialSyn" -ForegroundColor Green
    Write-Host "  [5] EMPRESARIAL   - + SynCards + Competencia (TODO)" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Selecciona (1-5): " -NoNewline -ForegroundColor Yellow
    $selection = Read-Host
    switch ($selection) {
        '1' { return @{ Name = 'basico'; Label = 'Basico'; Modules = @('chatbot') } }
        '2' { return @{ Name = 'profesional'; Label = 'Profesional'; Modules = @('agentSyn') } }
        '3' { return @{ Name = 'avanzado'; Label = 'Avanzado'; Modules = @('agentSyn', 'transcripSyn') } }
        '4' { return @{ Name = 'marketing'; Label = 'Marketing'; Modules = @('agentSyn', 'transcripSyn', 'marketSyn', 'socialSyn') } }
        '5' { return @{ Name = 'empresarial'; Label = 'Empresarial'; Modules = @('agentSyn', 'transcripSyn', 'marketSyn', 'socialSyn', 'synCards', 'competenciaSyn', 'voiceSyn') } }
        default { return @{ Name = 'profesional'; Label = 'Profesional'; Modules = @('agentSyn') } }
    }
}

function Get-ExistingProjects {
    $projects = @()
    $ScriptDir = $PSScriptRoot
    
    # 1. V3 Project (Golden Path - Local)
    # Check for V3 config in features/synergos
    if (Test-Path "$ScriptDir\src\features\synergos\config\synergos-config.ts") {
        $projects += [PSCustomObject]@{
            Name     = "Synergos V3 (Golden Path)"
            FullName = $ScriptDir
            Type     = "V3-Root"
            Url      = "https://saas-factory-tau.vercel.app"
        }
    }
    
    # 2. V3 Database Tenants (Real Neon Clients)
    # This replaces the legacy src/projects/ folder listing
    if (Test-Path "$ScriptDir\src\scripts\list-tenants.mjs") {
        try {
            # Run node script and capture JSON output
            # Use --no-warnings to avoid noise
            $jsonOutput = node "$ScriptDir\src\scripts\list-tenants.mjs" 2>$null | Out-String
            
            if ($jsonOutput -and $jsonOutput.Trim().StartsWith("[")) {
                $tenants = $jsonOutput | ConvertFrom-Json
                
                foreach ($t in $tenants) {
                    $projects += [PSCustomObject]@{
                        Name     = "$($t.name) (V3 Tenant)"
                        FullName = $ScriptDir # All V3 tenants share the same source code
                        Type     = "V3-Tenant"
                        Url      = "https://saas-factory-tau.vercel.app/pwa/$($t.slug)"
                        Slug     = $t.slug
                    }
                }
            }
        } catch {
            # Silently fail fetching tenants from DB
        }
    }

    # 3. V1 Projects (Legacy - Vercel)
    $V1Projects = @(
        @{ Name = "Synergos Solutions V1"; Url = "https://synergos-solutions.vercel.app/"; Type = "V1" },
        @{ Name = "Etna Moros"; Url = "https://etna-moros.vercel.app/"; Type = "V1" },
        @{ Name = "Iglesia Coromoto"; Url = "https://iglesia-coromoto.vercel.app/"; Type = "V1" }
    )
    
    foreach ($p in $V1Projects) {
        $projects += [PSCustomObject]@{
            Name     = $p.Name
            FullName = $null 
            Type     = "V1-External"
            Url      = $p.Url
        }
    }
    
    return $projects
}

function Read-ConfigTS {
    param([string]$ConfigPath)
    
    # V3 Path Correction: If ConfigPath ends in \config.ts but it doesn't exist,
    # try the V3 config path if we are in root.
    
    if (-not (Test-Path $ConfigPath)) {
        # Try finding synergos-config.ts if this is V3 root
        if ($ConfigPath -match "config.ts$") {
            $V3Path = $ConfigPath.Replace("config.ts", "src\features\synergos\config\synergos-config.ts")
            if (Test-Path $V3Path) {
                $ConfigPath = $V3Path
            } else {
                 return $null
            }
        } else {
            return $null
        }
    }
    
    $content = Get-Content $ConfigPath -Raw
    $config = @{}
    
    if ($content -match 'agentName:\s*"([^"]+)"') { $config.agentName = $matches[1] }
    if ($content -match 'agentRole:\s*"([^"]+)"') { $config.agentRole = $matches[1] }
    if ($content -match 'slogan:\s*"([^"]+)"') { $config.slogan = $matches[1] }
    if ($content -match 'owner:\s*"([^"]+)"') { $config.owner = $matches[1] }
    if ($content -match 'primaryColor:\s*"([^"]+)"') { $config.primaryColor = $matches[1] }
    if ($content -match 'accentColor:\s*"([^"]+)"') { $config.accentColor = $matches[1] }
    if ($content -match 'backgroundColor:\s*"([^"]+)"') { $config.backgroundColor = $matches[1] }
    if ($content -match 'textColor:\s*"([^"]+)"') { $config.textColor = $matches[1] }
    if ($content -match 'agentSyn:\s*"([^"]+)"') { $config.webhook_agentSyn = $matches[1] }
    if ($content -match 'marketSyn:\s*"([^"]+)"') { $config.webhook_marketSyn = $matches[1] }
    if ($content -match 'transcripSyn:\s*"([^"]+)"') { $config.webhook_transcripSyn = $matches[1] }
    if ($content -match 'socialSyn:\s*"([^"]+)"') { $config.webhook_socialSyn = $matches[1] }
    
    return $config
}

function List-Projects {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "           TODOS LOS PROYECTOS (V3 Tenants + V1)" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    
    $projects = Get-ExistingProjects
    
    # =========================================
    # SECCION V3: Clientes en DB (PWA Multi-Tenant)
    # =========================================
    Write-Host "  [V3] CLIENTES MULTI-TENANT (Database)" -ForegroundColor Green
    Write-Host "  -------------------------------------------" -ForegroundColor DarkGray
    
    $v3Tenants = $projects | Where-Object { $_.Type -eq "V3-Tenant" }
    
    if ($v3Tenants.Count -eq 0) {
        Write-Host "      (Sin clientes detectados en Neon DB)" -ForegroundColor DarkGray
        Write-Host "      Verifica DATABASE_URL en .env.local" -ForegroundColor DarkGray
    } else {
        $i = 1
        foreach ($t in $v3Tenants) {
            Write-Host "      [$i] $($t.Name)" -ForegroundColor White
            Write-Host "          $($t.Url)" -ForegroundColor Cyan
            $i++
        }
    }
    
    Write-Host ""
    
    # =========================================
    # SECCION V1: Proyectos Legacy en Vercel
    # =========================================
    Write-Host "  [V1] PROYECTOS LEGACY EN VERCEL" -ForegroundColor Yellow
    Write-Host "  -------------------------------------------" -ForegroundColor DarkGray
    
    $v1Projects = $projects | Where-Object { $_.Type -eq "V1-External" }
    
    $i = 1
    foreach ($p in $v1Projects) {
        Write-Host "      [$i] $($p.Name)" -ForegroundColor White
        Write-Host "          $($p.Url)" -ForegroundColor Cyan
        $i++
    }
    
    Write-Host ""
    Write-Host "  [MOTOR V3] Desarrollo Local" -ForegroundColor Magenta
    Write-Host "  -------------------------------------------" -ForegroundColor DarkGray
    $synergosConfig = "$PSScriptRoot\src\features\synergos\config\synergos-config.ts"
    if (Test-Path $synergosConfig) {
        Write-Host "      Synergos Solutions V3 (Golden Path)" -ForegroundColor White
        Write-Host "      http://localhost:3000" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
}

function Edit-ExistingProject {
    Write-Host ""
    Write-Host "EDITAR PROYECTO EXISTENTE" -ForegroundColor Cyan
    Write-Host "===========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $projects = Get-ExistingProjects
    
    if ($projects.Count -eq 0) {
        Write-Host "   No hay proyectos para editar" -ForegroundColor Yellow
        Write-Host "   Usa [N] para crear uno nuevo" -ForegroundColor Gray
        Write-Host ""
        return
    }
    
    Write-Host "Proyectos disponibles:" -ForegroundColor White
    Write-Host ""
    $i = 1
    foreach ($project in $projects) {
        Write-Host "   [$i] $($project.Name)" -ForegroundColor Cyan
        $i++
    }
    Write-Host ""
    Write-Host "Selecciona proyecto (1-$($projects.Count)): " -NoNewline -ForegroundColor Yellow
    $selection = Read-Host
    
    $idx = [int]$selection - 1
    if ($idx -lt 0 -or $idx -ge $projects.Count) {
        Write-Host "   Seleccion invalida" -ForegroundColor Red
        return
    }
    
    $selectedProject = $projects[$idx]
    $configPath = "$($selectedProject.FullName)\config.ts"
    $config = Read-ConfigTS -ConfigPath $configPath
    
    if (-not $config) {
        Write-Host "   No se pudo leer la configuracion" -ForegroundColor Red
        return
    }
    
    Write-Host ""
    Write-Host "Editando: $($selectedProject.Name)" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Que deseas editar?" -ForegroundColor Cyan
    Write-Host "  [1] Informacion de la Empresa"
    Write-Host "  [2] Webhooks N8N"
    Write-Host "  [3] Colores del Tema"
    Write-Host "  [4] Redes Sociales"
    Write-Host ""
    Write-Host "Opcion: " -NoNewline -ForegroundColor Yellow
    $editOption = Read-Host
    
    switch ($editOption) {
        '1' {
            $config.agentName = Get-InputWithDefault -Prompt "Nombre de la Empresa" -Default $config.agentName
            $config.agentRole = Get-InputWithDefault -Prompt "Rol del Agente" -Default $config.agentRole
            $config.slogan = Get-InputWithDefault -Prompt "Slogan" -Default $config.slogan
            $config.owner = Get-InputWithDefault -Prompt "Dueno" -Default $config.owner
        }
        '2' {
            Write-Host ""
            Write-Host "Webhooks N8N:" -ForegroundColor Cyan
            $config.webhook_agentSyn = Get-InputWithDefault -Prompt "Webhook AgentSyn" -Default $config.webhook_agentSyn
            $config.webhook_marketSyn = Get-InputWithDefault -Prompt "Webhook MarketSyn" -Default $config.webhook_marketSyn
            $config.webhook_transcripSyn = Get-InputWithDefault -Prompt "Webhook TranscripSyn" -Default $config.webhook_transcripSyn
            $config.webhook_socialSyn = Get-InputWithDefault -Prompt "Webhook SocialSyn" -Default $config.webhook_socialSyn
        }
        '3' {
            Write-Host ""
            Write-Host "Colores:" -ForegroundColor Cyan
            $config.primaryColor = Get-ColorInput -ColorName "Color Primario" -Default $config.primaryColor -Description "Header"
            $config.accentColor = Get-ColorInput -ColorName "Color Acento" -Default $config.accentColor -Description "Bordes"
            $config.backgroundColor = Get-ColorInput -ColorName "Color Fondo" -Default $config.backgroundColor -Description "Fondo"
            $config.textColor = Get-ColorInput -ColorName "Color Texto" -Default $config.textColor -Description "Texto"
        }
        default {
            Write-Host "   Opcion invalida" -ForegroundColor Red
            return
        }
    }
    
    Write-Host ""
    Write-Host "Guardar cambios? (S/N): " -NoNewline -ForegroundColor Yellow
    $confirm = Read-Host
    
    if ($confirm -match '^[Ss]$') {
        $content = Get-Content $configPath -Raw
        
        $content = $content -replace 'agentName:\s*"[^"]*"', "agentName: `"$($config.agentName)`""
        $content = $content -replace 'agentRole:\s*"[^"]*"', "agentRole: `"$($config.agentRole)`""
        $content = $content -replace 'slogan:\s*"[^"]*"', "slogan: `"$($config.slogan)`""
        $content = $content -replace 'owner:\s*"[^"]*"', "owner: `"$($config.owner)`""
        $content = $content -replace 'primaryColor:\s*"[^"]*"', "primaryColor: `"$($config.primaryColor)`""
        $content = $content -replace 'accentColor:\s*"[^"]*"', "accentColor: `"$($config.accentColor)`""
        $content = $content -replace 'backgroundColor:\s*"[^"]*"', "backgroundColor: `"$($config.backgroundColor)`""
        $content = $content -replace 'textColor:\s*"[^"]*"', "textColor: `"$($config.textColor)`""
        $content = $content -replace '(webhooks:.*?agentSyn:\s*)"[^"]*"', "`$1`"$($config.webhook_agentSyn)`""
        $content = $content -replace '(webhooks:.*?marketSyn:\s*)"[^"]*"', "`$1`"$($config.webhook_marketSyn)`""
        $content = $content -replace '(webhooks:.*?transcripSyn:\s*)"[^"]*"', "`$1`"$($config.webhook_transcripSyn)`""
        $content = $content -replace '(webhooks:.*?socialSyn:\s*)"[^"]*"', "`$1`"$($config.webhook_socialSyn)`""
        
        Set-Content $configPath $content -Encoding UTF8
        Write-Host ""
        Write-Host "Configuracion actualizada!" -ForegroundColor Green
    }
    else {
        Write-Host "   Cambios cancelados" -ForegroundColor Yellow
    }
    Write-Host ""
}

function Configure-Webhooks {
    Write-Host ""
    Write-Host "CONFIGURAR WEBHOOKS N8N" -ForegroundColor Cyan
    Write-Host "===========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $projects = Get-ExistingProjects
    
    if ($projects.Count -eq 0) {
        Write-Host "   No hay proyectos configurados" -ForegroundColor Yellow
        Write-Host ""
        return
    }
    
    Write-Host "Proyectos:" -ForegroundColor White
    $i = 1
    foreach ($project in $projects) {
        Write-Host "   [$i] $($project.Name)" -ForegroundColor Cyan
        $i++
    }
    Write-Host ""
    Write-Host "Selecciona proyecto (1-$($projects.Count)): " -NoNewline -ForegroundColor Yellow
    $selection = Read-Host
    
    $idx = [int]$selection - 1
    if ($idx -lt 0 -or $idx -ge $projects.Count) {
        Write-Host "   Seleccion invalida" -ForegroundColor Red
        return
    }
    
    $selectedProject = $projects[$idx]
    $configPath = "$($selectedProject.FullName)\config.ts"
    $config = Read-ConfigTS -ConfigPath $configPath
    
    Write-Host ""
    Write-Host "Configurando webhooks para: $($selectedProject.Name)" -ForegroundColor Green
    Write-Host ""
    
    $config.webhook_agentSyn = Get-InputWithDefault -Prompt "Webhook AgentSyn (UUID)" -Default $config.webhook_agentSyn
    $config.webhook_marketSyn = Get-InputWithDefault -Prompt "Webhook MarketSyn" -Default $config.webhook_marketSyn
    $config.webhook_transcripSyn = Get-InputWithDefault -Prompt "Webhook TranscripSyn" -Default $config.webhook_transcripSyn
    $config.webhook_socialSyn = Get-InputWithDefault -Prompt "Webhook SocialSyn" -Default $config.webhook_socialSyn
    
    Write-Host ""
    Write-Host "Guardar? (S/N): " -NoNewline -ForegroundColor Yellow
    $confirm = Read-Host
    
    if ($confirm -match '^[Ss]$') {
        $content = Get-Content $configPath -Raw
        $content = $content -replace '(webhooks:.*?agentSyn:\s*)"[^"]*"', "`$1`"$($config.webhook_agentSyn)`""
        $content = $content -replace '(webhooks:.*?marketSyn:\s*)"[^"]*"', "`$1`"$($config.webhook_marketSyn)`""
        $content = $content -replace '(webhooks:.*?transcripSyn:\s*)"[^"]*"', "`$1`"$($config.webhook_transcripSyn)`""
        $content = $content -replace '(webhooks:.*?socialSyn:\s*)"[^"]*"', "`$1`"$($config.webhook_socialSyn)`""
        Set-Content $configPath $content -Encoding UTF8
        Write-Host ""
        Write-Host "Webhooks actualizados!" -ForegroundColor Green
    }
    Write-Host ""
}

function New-ConfigTS {
    param($CompanyName, $AgentRole, $Slogan, $OwnerName, $Package, $PrimaryColor, $AccentColor, $BackgroundColor, $TextColor, $Webhook_AgentSyn, $Webhook_TranscripSyn, $Webhook_MarketSyn, $Webhook_SocialSyn, $FacebookAppId, $InstagramAppId)
    
    $modAgentSyn = if ($Package.Modules -contains 'agentSyn') { 'true' } else { 'false' }
    $modTranscripSyn = if ($Package.Modules -contains 'transcripSyn') { 'true' } else { 'false' }
    $modMarketSyn = if ($Package.Modules -contains 'marketSyn') { 'true' } else { 'false' }
    $modSocialSyn = if ($Package.Modules -contains 'socialSyn') { 'true' } else { 'false' }
    $modSynCards = if ($Package.Modules -contains 'synCards') { 'true' } else { 'false' }
    $modCompetencia = if ($Package.Modules -contains 'competenciaSyn') { 'true' } else { 'false' }
    $modVoiceSyn = if ($Package.Modules -contains 'voiceSyn') { 'true' } else { 'false' }
    
    $lines = @()
    $lines += "export const clientConfig = {"
    $lines += "    agentName: `"$CompanyName`","
    $lines += "    agentRole: `"$AgentRole`","
    $lines += "    slogan: `"$Slogan`","
    $lines += "    owner: `"$OwnerName`","
    $lines += "    license: {"
    $lines += "        package: `"$($Package.Name)`","
    $lines += "        label: `"$($Package.Label)`","
    $lines += "        createdAt: `"$(Get-Date -Format 'yyyy-MM-dd')`""
    $lines += "    },"
    $lines += "    theme: {"
    $lines += "        primaryColor: `"$PrimaryColor`","
    $lines += "        accentColor: `"$AccentColor`","
    $lines += "        backgroundColor: `"$BackgroundColor`","
    $lines += "        textColor: `"$TextColor`""
    $lines += "    },"
    $lines += "    webhooks: {"
    $lines += "        baseUrl: `"`","
    $lines += "        agentSyn: `"$Webhook_AgentSyn`","
    $lines += "        transcripSyn: `"$Webhook_TranscripSyn`","
    $lines += "        marketSyn: `"$Webhook_MarketSyn`","
    $lines += "        socialSyn: `"$Webhook_SocialSyn`""
    $lines += "    },"
    $lines += "    social: {"
    $lines += "        facebookAppId: `"$FacebookAppId`","
    $lines += "        instagramAppId: `"$InstagramAppId`""
    $lines += "    },"
    $lines += "    modules: {"
    $lines += "        agentSyn: $modAgentSyn,"
    $lines += "        transcripSyn: $modTranscripSyn,"
    $lines += "        marketSyn: $modMarketSyn,"
    $lines += "        socialSyn: $modSocialSyn,"
    $lines += "        synCards: $modSynCards,"
    $lines += "        competenciaSyn: $modCompetencia,"
    $lines += "        voiceSyn: $modVoiceSyn"
    $lines += "    }"
    $lines += "};"
    return ($lines -join "`r`n")
}

function New-SummaryMD {
    param($CompanyName, $N8N_ServerIP, $N8N_Port, $Webhook_AgentSyn, $Webhook_MarketSyn, $Webhook_SocialSyn)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $lines = @()
    $lines += "# Configuracion Cliente SaaS: $CompanyName"
    $lines += "Generado: $timestamp"
    $lines += ""
    $lines += "## Webhooks N8N"
    $lines += "Servidor: http://${N8N_ServerIP}:${N8N_Port}"
    $lines += "AgentSyn: $Webhook_AgentSyn"
    $lines += "MarketSyn: $Webhook_MarketSyn"
    $lines += "SocialSyn: $Webhook_SocialSyn"
    return ($lines -join "`r`n")
}

function New-SaaSClient {
    Write-Host ""
    Write-Host "NUEVO CLIENTE SAAS - CONFIGURACION COMPLETA" -ForegroundColor Cyan
    Write-Host ""
    
    $Package = Select-Package
    Write-Host ""
    Write-Host "   Paquete seleccionado: $($Package.Label)" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "SECCION 1: INFORMACION DE LA EMPRESA" -ForegroundColor Cyan
    $CompanyName = Get-InputWithDefault -Prompt "Nombre de la Empresa" -Default "Mi Empresa SaaS"
    $ProjectSlug = Get-InputWithDefault -Prompt "Nombre de Carpeta" -Default ($CompanyName.ToLower() -replace ' ', '-')
    $OwnerName = Get-InputWithDefault -Prompt "Nombre del Dueno" -Default "CEO"
    $AgentRole = Get-InputWithDefault -Prompt "Rol del Agente" -Default "Asistente IA"
    $Slogan = Get-InputWithDefault -Prompt "Slogan" -Default "Automatizacion Inteligente"
    
    Write-Host ""
    Write-Host "SECCION 2: WEBHOOKS N8N" -ForegroundColor Cyan
    $N8N_ServerIP = Get-InputWithDefault -Prompt "IP del Servidor N8N" -Default "3.148.170.122"
    $N8N_Port = Get-InputWithDefault -Prompt "Puerto de N8N" -Default "5678"
    $Webhook_AgentSyn = Get-InputWithDefault -Prompt "Webhook AgentSyn" -Default "ef270b01-9c77-45d3-9e6b-67183746f597"
    $Webhook_TranscripSyn = Get-InputWithDefault -Prompt "Webhook TranscripSyn" -Default "68eaa1a6-e250-4f52-863c-338cd9dd9119"
    $Webhook_MarketSyn = Get-InputWithDefault -Prompt "Webhook MarketSyn" -Default "marketsyn-strategy"
    $Webhook_SocialSyn = Get-InputWithDefault -Prompt "Webhook SocialSyn" -Default "social-publisher"
    
    Write-Host ""
    Write-Host "SECCION 3: PALETA DE COLORES" -ForegroundColor Cyan
    $PrimaryColor = Get-ColorInput -ColorName "Color Primario" -Default "#022c22" -Description "Header, botones"
    $AccentColor = Get-ColorInput -ColorName "Color de Acento" -Default "#34d399" -Description "Bordes, iconos"
    $BackgroundColor = Get-ColorInput -ColorName "Color de Fondo" -Default "#f0fdf4" -Description "Fondo"
    $TextColor = Get-ColorInput -ColorName "Color de Texto" -Default "#064e3b" -Description "Texto"
    
    Write-Host ""
    Write-Host "SECCION 4: REDES SOCIALES (Opcional)" -ForegroundColor Cyan
    $FacebookAppId = Get-InputWithDefault -Prompt "Facebook App ID" -Default ""
    $InstagramAppId = Get-InputWithDefault -Prompt "Instagram App ID" -Default ""
    
    Write-Host ""
    Write-Host "RESUMEN" -ForegroundColor Green
    Write-Host "   Empresa: $CompanyName"
    Write-Host "   Proyecto: $ProjectSlug"
    Write-Host "   Servidor N8N: http://${N8N_ServerIP}:${N8N_Port}"
    Write-Host "   Colores: $PrimaryColor / $AccentColor"
    Write-Host ""
    Write-Host "Crear proyecto? (S/N): " -NoNewline -ForegroundColor Yellow
    $confirm = Read-Host
    
    if ($confirm -notmatch '^[Ss]$') {
        Write-Host "Instalacion cancelada." -ForegroundColor Red
        return
    }
    
    $ScriptDir = $PSScriptRoot
    $ProjectRoot = $ScriptDir
    if (-not (Test-Path "$ProjectRoot\src")) {
        $ProjectRoot = Split-Path -Parent $ScriptDir
    }
    $NewProjectDir = "$ProjectRoot\src\projects\$ProjectSlug"
    
    Write-Host ""
    Write-Host "CREANDO PROYECTO: $ProjectSlug" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "   [1/4] Creando carpeta..." -NoNewline
    if (-not (Test-Path $NewProjectDir)) {
        New-Item -ItemType Directory -Path $NewProjectDir -Force | Out-Null
    }
    Write-Host " OK" -ForegroundColor Green
    
    Write-Host "   [2/4] Generando config.ts..." -NoNewline
    $configContent = New-ConfigTS -CompanyName $CompanyName -AgentRole $AgentRole -Slogan $Slogan -OwnerName $OwnerName -Package $Package -PrimaryColor $PrimaryColor -AccentColor $AccentColor -BackgroundColor $BackgroundColor -TextColor $TextColor -Webhook_AgentSyn $Webhook_AgentSyn -Webhook_TranscripSyn $Webhook_TranscripSyn -Webhook_MarketSyn $Webhook_MarketSyn -Webhook_SocialSyn $Webhook_SocialSyn -FacebookAppId $FacebookAppId -InstagramAppId $InstagramAppId
    Set-Content "$NewProjectDir\config.ts" $configContent -Encoding UTF8
    Write-Host " OK" -ForegroundColor Green
    
    Write-Host "   [3/4] Copiando templates..." -NoNewline
    $TemplatesDir = "$ProjectRoot\src\templates"
    if (Test-Path "$TemplatesDir\Header.template.tsx") {
        Copy-Item "$TemplatesDir\Header.template.tsx" "$NewProjectDir\Header.tsx" -Force
    }
    if (Test-Path "$TemplatesDir\Page.template.tsx") {
        Copy-Item "$TemplatesDir\Page.template.tsx" "$NewProjectDir\Page.tsx" -Force
    }
    Write-Host " OK" -ForegroundColor Green
    
    Write-Host "   [4/4] Guardando resumen..." -NoNewline
    $summaryContent = New-SummaryMD -CompanyName $CompanyName -N8N_ServerIP $N8N_ServerIP -N8N_Port $N8N_Port -Webhook_AgentSyn $Webhook_AgentSyn -Webhook_MarketSyn $Webhook_MarketSyn -Webhook_SocialSyn $Webhook_SocialSyn
    Set-Content "$ProjectRoot\CLIENTE_$ProjectSlug.md" $summaryContent -Encoding UTF8
    Write-Host " OK" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "PROYECTO CREADO CON EXITO!" -ForegroundColor Green
    Write-Host "   Ubicacion: $NewProjectDir"
    Write-Host ""
}

function Start-Dev {
    Write-Host ""
    Write-Host "INICIANDO FABRICA (DEV SERVER)" -ForegroundColor Cyan
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host ""
    
    $ScriptDir = $PSScriptRoot
    Set-Location $ScriptDir
    
    Write-Host "Ejecutando: npm run dev" -ForegroundColor Yellow
    Write-Host "Presiona Ctrl+C para detener el servidor y volver al menu." -ForegroundColor Gray
    Write-Host ""
    
    npm run dev
}

function Build-Local {
    Write-Host ""
    Write-Host "BUILD LOCAL" -ForegroundColor Magenta
    Write-Host "==============================================" -ForegroundColor Magenta
    Write-Host ""
    
    $ScriptDir = $PSScriptRoot
    Set-Location $ScriptDir
    
    Write-Host "Ejecutando: npm run build" -ForegroundColor Yellow
    Write-Host ""
    
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Build completado exitosamente!" -ForegroundColor Green
    }
    else {
        Write-Host ""
        Write-Host "Error en el build" -ForegroundColor Red
    }
}

function Build-AndVerify {
    Write-Host ""
    Write-Host "BUILD + VERIFICAR" -ForegroundColor Magenta
    Write-Host "==============================================" -ForegroundColor Magenta
    Write-Host ""
    
    $ScriptDir = $PSScriptRoot
    Set-Location $ScriptDir
    
    Write-Host "[1/2] Ejecutando build..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "Build fallido. No se puede continuar." -ForegroundColor Red
        return
    }
    
    Write-Host ""
    Write-Host "[2/2] Verificando archivos generados..." -ForegroundColor Yellow
    
    if (Test-Path "dist/index.html") {
        $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host ""
        Write-Host "Build exitoso!" -ForegroundColor Green
        Write-Host "Tamano dist/: $([math]::Round($distSize, 2)) MB" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Archivos principales:" -ForegroundColor Cyan
        Get-ChildItem -Path "dist" -File | Select-Object -First 10 | ForEach-Object {
            Write-Host "   $($_.Name)" -ForegroundColor Gray
        }
    }
    else {
        Write-Host ""
        Write-Host "Advertencia: No se encontro dist/index.html" -ForegroundColor Yellow
    }
}

function Deploy-ToVercel {
    Save-AndPushGit
}

function Deploy-Manual {
    Write-Host ""
    Write-Host "DEPLOY MANUAL (FINAL)" -ForegroundColor Cyan
    Write-Host "==============================================" -ForegroundColor Cyan
    
    $ScriptDir = $PSScriptRoot
    Set-Location $ScriptDir
    
    # Use the FIXED function to get projects
    $Projects = Get-ExistingProjects
    
    if ($Projects.Count -eq 0) {
        Write-Host "   No hay proyectos disponibles." -ForegroundColor Yellow
        return
    }
    
    $Index = 1
    foreach ($Project in $Projects) {
        $TypeLabel = switch ($Project.Type) {
            "V3-Root"   { "[V3 ENGINE]" }
            "V3-Tenant" { "[V3 CLIENT]" }
            default     { "[V1 ONLINE]" }
        }
        Write-Host "   [$Index] $($Project.Name) $TypeLabel" -ForegroundColor White
        Write-Host "         $($Project.Url)" -ForegroundColor DarkGray
        $Index++
    }
    
    Write-Host ""
    $Selection = Read-Host "   Ingresa el numero"
    
    if (-not ($Selection -match '^\d+$' -and [int]$Selection -ge 1 -and [int]$Selection -le $Projects.Count)) {
        Write-Host "   Invalido" -ForegroundColor Red
        return
    }

    $SelectedProject = $Projects[[int]$Selection - 1]
    Write-Host "   Seleccionado: $($SelectedProject.Name)" -ForegroundColor Green
    Write-Host ""
    
    # Handle V3 Tenants (Deploying them means deploying the Engine)
    if ($SelectedProject.Type -eq "V3-Tenant") {
        Write-Host "   [!] NOTA: Al desplegar un cliente V3, estas actualizando el MOTOR Synergos V3." -ForegroundColor Yellow
        Write-Host "   Todos los clientes comparten este mismo codigo." -ForegroundColor Gray
        Write-Host ""
        # Proceed as V3-Root
        $SelectedProject.Type = "V3-Root" 
    }
    
    if ($SelectedProject.Type -ne "V3-Root") {
        Write-Host "   Este proyecto (V1) es externo y no se puede desplegar desde aqui." -ForegroundColor Yellow
        Write-Host "   Abriendo URL..." -ForegroundColor Gray
        Start-Process $SelectedProject.Url
        return
    }

    # Logic for V3 Deployment
    # Use config agentName or folder name as project name request?
    # Actually Vercel CLI usually asks, but we can pass --name if we want.
    # We will just let Vercel CLI handle it or assume current dir.

    
    
    $VercelArgs = ""
    if ($env:VERCEL_TOKEN) {
        Write-Host "   Token detectado." -ForegroundColor Cyan
        $VercelArgs = "--token $env:VERCEL_TOKEN"
    }

    # Si es V3 Root, ya estamos en el directorio correcto.
    # No forzamos "vercel link --project" con el nombre human-readable porque fallara.
    # Dejamos que Vercel detecte la configuracion local (.vercel) o pregunte.
    
    if ($SelectedProject.Type -eq "V3-Root") {
        Write-Host "   [1/1] Desplegando V3 (Golden Path)..." -ForegroundColor Cyan
        
        # Eliminar --yes para permitir que Vercel pregunte si hace falta linkear
        cmd /c "vercel --prod $VercelArgs"
    }
    else {
        # Fallback para proyectos legacy si alguna vez soportamos source code externo
        Write-Host "   [!] Deploy no soportado para este tipo de proyecto." -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "   [3/3] Obteniendo Link Definitivo..." -ForegroundColor Gray
    
    try {
        $ListOutput = cmd /c "vercel ls $SelectedProject --prod $VercelArgs" 2>&1
        $Url = $ListOutput | Where-Object { $_ -match 'https://' } | Select-Object -First 1
        
        if ($Url -match '(https://\S+)') { $Url = $matches[1] }
        
        if ($Url) {
            Write-Host ""
            Write-Host "   =================================================" -ForegroundColor Green
            Write-Host "   Link: $Url" -ForegroundColor Cyan
            Write-Host "   =================================================" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "   Error obteniendo URL" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "   Presiona ENTER para volver..."
    $null = Read-Host
}


function Save-AndPushGit {
    Write-Host ""
    Write-Host "🚀 DEPLOY A VERCEL (AUTOMATICO)" -ForegroundColor Cyan
    Write-Host "==============================================" -ForegroundColor Cyan
    
    $ScriptDir = $PSScriptRoot
    Set-Location $ScriptDir
    
    Write-Host "   Esta accion guardara todos los cambios y actualizara el sitio." -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Presiona ENTER para iniciar..." -NoNewline -ForegroundColor Yellow
    $null = Read-Host
    
    Write-Host ""
    Write-Host "   [1/3] Preparando archivos..." -ForegroundColor Gray
    git add -A
    
    Write-Host "   [2/3] Guardando version..." -ForegroundColor Gray
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    git commit -m "Auto-Deploy: $timestamp"
    
    Write-Host "   [3/3] Subiendo a la nube..." -ForegroundColor Gray
    git push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "   ✅ EXITOSO! Los cambios estaran online en breve." -ForegroundColor Green
    }
    else {
        Write-Host ""
        Write-Host "   ⚠️ Alerta: Verifica si hubo errores arriba." -ForegroundColor Red
    }
    Write-Host ""
}

function Invoke-Guardian {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "                SAAS GUARDIAN - V4 BRAIN" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    
    $MemoryPath = "$PSScriptRoot\memory_bank.json"
    if (-not (Test-Path $MemoryPath)) {
        Write-Host "   [!] No se encontro el Memory Bank." -ForegroundColor Yellow
        Write-Host "   Creando uno nuevo con estructura V4..." -ForegroundColor Gray
        $initialMemory = @{
            infrastructure = @();
            ai_llm = @();
            auth_security = @();
            project_pse = @();
            ui_ux = @()
        } | ConvertTo-Json -Depth 10
        Set-Content $MemoryPath $initialMemory
    }
    
    $Memory = Get-Content $MemoryPath | ConvertFrom-Json
    
    Write-Host "ESTADO DEL CEREBRO (Categorizado V4):" -ForegroundColor Green
    Write-Host "   Infrastructure:  $($Memory.infrastructure.Count)" -ForegroundColor White
    Write-Host "   AI & LLM:        $($Memory.ai_llm.Count)" -ForegroundColor White
    Write-Host "   Auth & Security: $($Memory.auth_security.Count)" -ForegroundColor White
    Write-Host "   Project PSE:     $($Memory.project_pse.Count)" -ForegroundColor White
    Write-Host "   UI & UX:         $($Memory.ui_ux.Count)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "ULTIMOS INSIGHTS (Deep Intelligence):" -ForegroundColor Cyan
    $AllPatterns = @()
    $AllPatterns += $Memory.infrastructure
    $AllPatterns += $Memory.ai_llm
    $AllPatterns += $Memory.auth_security
    $AllPatterns += $Memory.project_pse
    $AllPatterns += $Memory.ui_ux
    
    if ($AllPatterns.Count -gt 0) {
        $AllPatterns | Select-Object -Last 5 | ForEach-Object {
            Write-Host "   - [$($_.pattern_name)]: $($_.insight)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   (Vacio) La fabrica esta virgen. Genera conocimiento." -ForegroundColor DarkGray
    }
    Write-Host ""
    
    Write-Host "EJECUTANDO VALIDACION ESTRUCTURAL..." -ForegroundColor Yellow
    $ErrorsFound = $false
    
    # Check 1: V3 Structure Validation
    $FeaturesDir = "$PSScriptRoot\src\features"
    if (-not (Test-Path $FeaturesDir)) {
         Write-Host "   [!] Check 1: Estructura V3 incompleta (Falta src/features)" -ForegroundColor Red
         $ErrorsFound = $true
    } else {
         Write-Host "   [ok] Check 1: Estructura V3 validada (Feature-First)." -ForegroundColor Green
    }
    
    # Check 2: MCP placeholders
    if (-not (Get-Content "$PSScriptRoot\.mcp.json" | Select-String "YOUR_SUPABASE")) {
        Write-Host "   [ok] Supabase MCP parece configurado." -ForegroundColor Green
    } else {
        Write-Host "   [!] ADVERTENCIA: Supabase MCP tiene placeholders." -ForegroundColor Yellow
    }
    
    Write-Host ""
    if (-not $ErrorsFound) {
        Write-Host "   ✅ TODO EN ORDEN. La fabrica esta blindada." -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Presiona ENTER para volver..."
    Read-Host
}

function New-PWATenant {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Blue
    Write-Host "             CREAR NUEVO TENANT PWA" -ForegroundColor Blue
    Write-Host "============================================================" -ForegroundColor Blue
    Write-Host ""
    Write-Host "   Este creara un nuevo cliente en el Motor PWA Multi-Tenant." -ForegroundColor Gray
    Write-Host ""
    
    # Recopilar datos
    $TenantName = Get-InputWithDefault -Prompt "Nombre de la Empresa" -Default "Mi Empresa"
    $TenantSlug = Get-InputWithDefault -Prompt "Slug (URL-friendly)" -Default ($TenantName.ToLower() -replace ' ', '-' -replace '[^a-z0-9-]', '')
    
    Write-Host ""
    Write-Host "CONFIGURACION VISUAL:" -ForegroundColor Cyan
    $PrimaryColor = Get-ColorInput -ColorName "Color Primario" -Default "#6366f1" -Description "Botones, header"
    $SecondaryColor = Get-ColorInput -ColorName "Color Secundario" -Default "#f472b6" -Description "Acentos"
    $PWAName = Get-InputWithDefault -Prompt "Nombre de la PWA" -Default $TenantName
    $PWAShortName = Get-InputWithDefault -Prompt "Nombre Corto (max 12 chars)" -Default ($TenantName.Substring(0, [Math]::Min(12, $TenantName.Length)))
    
    # ICONO DEL PWA
    Write-Host ""
    Write-Host "ICONO DEL PWA:" -ForegroundColor Magenta
    Write-Host "   Arrastra el archivo de imagen aqui o pega la ruta completa." -ForegroundColor Gray
    Write-Host "   (Formatos: PNG, JPG, SVG - Recomendado: 512x512px)" -ForegroundColor Gray
    Write-Host "   Dejar vacio para usar icono por defecto." -ForegroundColor DarkGray
    Write-Host "   > " -NoNewline -ForegroundColor Yellow
    $IconPath = Read-Host
    $IconPath = $IconPath.Trim('"').Trim("'")  # Quitar comillas si las hay
    
    $IconUrl = "/icons/icon-512.png"  # Default
    
    if ($IconPath -and (Test-Path $IconPath)) {
        # Crear carpeta icons si no existe
        $IconsDir = "$PSScriptRoot\public\icons"
        if (-not (Test-Path $IconsDir)) {
            New-Item -ItemType Directory -Path $IconsDir -Force | Out-Null
        }
        
        # Copiar icono con nombre del tenant
        $IconFileName = "$TenantSlug-icon.png"
        $DestPath = "$IconsDir\$IconFileName"
        Copy-Item $IconPath -Destination $DestPath -Force
        $IconUrl = "/icons/$IconFileName"
        Write-Host "   Icono copiado a: $DestPath" -ForegroundColor Green
    } elseif ($IconPath) {
        Write-Host "   Archivo no encontrado. Usando icono por defecto." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "RESUMEN:" -ForegroundColor Green
    Write-Host "   Nombre:    $TenantName"
    Write-Host "   Slug:      $TenantSlug"
    Write-Host "   PWA Name:  $PWAName"
    Write-Host "   Colores:   $PrimaryColor / $SecondaryColor"
    Write-Host "   Icono:     $IconUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Manifest URL: /api/pwa/manifest/$TenantSlug" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Crear tenant? (S/N): " -NoNewline -ForegroundColor Yellow
    $confirm = Read-Host
    
    if ($confirm -notmatch '^[Ss]$') {
        Write-Host "Cancelado." -ForegroundColor Red
        return
    }
    
    Write-Host ""
    Write-Host "Creando tenant en Neon..." -ForegroundColor Yellow
    
    # Crear script temporal para insertar en Neon
    $TempScript = @"
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

async function createTenant() {
    try {
        // Insert tenant
        const tenant = await sql\`
            INSERT INTO tenants (name, slug) 
            VALUES ('$TenantName', '$TenantSlug')
            ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
            RETURNING *
        \`;
        
        // Insert branding with icon
        await sql\`
            INSERT INTO branding_config (tenant_id, primary_color, secondary_color, pwa_name, pwa_short_name, app_icon_url)
            VALUES (\${tenant[0].id}, '$PrimaryColor', '$SecondaryColor', '$PWAName', '$PWAShortName', '$IconUrl')
            ON CONFLICT (tenant_id) DO UPDATE SET
                primary_color = EXCLUDED.primary_color,
                secondary_color = EXCLUDED.secondary_color,
                pwa_name = EXCLUDED.pwa_name,
                pwa_short_name = EXCLUDED.pwa_short_name,
                app_icon_url = EXCLUDED.app_icon_url
        \`;
        
        console.log('');
        console.log('TENANT CREADO EXITOSAMENTE!');
        console.log('===========================');
        console.log('API Key: ' + tenant[0].api_key);
        console.log('Manifest: /api/pwa/manifest/$TenantSlug');
        console.log('Icono: $IconUrl');
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}
createTenant();
"@
    
    $TempFile = "$PSScriptRoot\temp-create-tenant.mjs"
    Set-Content $TempFile $TempScript -Encoding UTF8
    
    try {
        node $TempFile
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "TENANT CREADO EXITOSAMENTE!" -ForegroundColor Green
        } else {
            Write-Host "Error al crear tenant" -ForegroundColor Red
        }
    }
    finally {
        Remove-Item $TempFile -ErrorAction SilentlyContinue
    }
}





function Create-User {
    Write-Host ""
    Write-Host "CREAR USUARIO ADMIN (NEON DB)" -ForegroundColor Cyan
    Write-Host "==============================================" -ForegroundColor Cyan
    
    $ScriptDir = $PSScriptRoot
    Set-Location $ScriptDir
    
    Write-Host "   Este comando creará un usuario en la tabla public.users" -ForegroundColor Gray
    Write-Host "   con contraseña hasheada (bcrypt) para el Login V3." -ForegroundColor Gray
    Write-Host ""
    
    $Email = Get-InputWithDefault -Prompt "Email del Usuario" -Default "admin@synergos.solutions"
    $Password = Read-Host "   Password (se ocultará al escribir) > " -AsSecureString
    
    # Convert SecureString to PlainText for passing to Node script (local environment trust)
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password)
    $PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    $Name = Get-InputWithDefault -Prompt "Nombre Completo" -Default "Admin User"
    
    Write-Host ""
    Write-Host "Creando usuario..." -ForegroundColor Yellow
    
    # Call the node script
    node "src/scripts/create-user.mjs" $Email $PlainPassword "$Name"
    
    Write-Host ""
    Write-Host "Presiona ENTER para volver..."
    $null = Read-Host
}

function Deploy-LandingSynergos {
    Write-Host ""
    Write-Host "🚀 DEPLOY LANDING SYNERGOS (synergosia.online)" -ForegroundColor Yellow
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host ""
    
    $LandingPath = "c:\Keys\synergos-landing"
    
    if (-not (Test-Path $LandingPath)) {
        Write-Host "   [ERROR] No se encontró el proyecto en: $LandingPath" -ForegroundColor Red
        Write-Host "   Verifica la ruta del proyecto landing." -ForegroundColor Gray
        return
    }
    
    Write-Host "   Directorio: $LandingPath" -ForegroundColor Cyan
    Write-Host "   Dominio: synergosia.online" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Esto desplegará los cambios a producción." -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Presiona ENTER para continuar o CTRL+C para cancelar..." -NoNewline -ForegroundColor Yellow
    $null = Read-Host
    
    Write-Host ""
    Write-Host "   [1/2] Cambiando al directorio de la landing..." -ForegroundColor Cyan
    Set-Location $LandingPath
    
    Write-Host "   [2/2] Ejecutando: vercel --prod" -ForegroundColor Cyan
    Write-Host ""
    
    $VercelArgs = ""
    if ($env:VERCEL_TOKEN) {
        Write-Host "   Token detectado." -ForegroundColor Green
        $VercelArgs = "--token $env:VERCEL_TOKEN"
    }
    
    cmd /c "vercel --prod $VercelArgs"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "   ================================================" -ForegroundColor Green
        Write-Host "   ✅ Landing Synergos desplegada exitosamente!" -ForegroundColor Green
        Write-Host "   🌐 https://synergosia.online" -ForegroundColor Cyan
        Write-Host "   ================================================" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "   [ERROR] El deploy falló. Revisa los errores arriba." -ForegroundColor Red
    }
    
    # Volver al directorio original
    Set-Location $PSScriptRoot
}


function Invoke-Orchestration {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "           ORQUESTADOR MULTI-AGENTE (A2A)" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Este comando inicia la linea de ensamblaje inteligente." -ForegroundColor Gray
    Write-Host "   Fases: Architect -> Builder -> Security -> DevOps" -ForegroundColor Gray
    Write-Host ""
    
    $Task = Get-InputWithDefault -Prompt "Describe la tarea compleja para la factoria" -Default "Crear un modulo de pagos con Stripe y validacion de seguridad"
    
    Write-Host ""
    Write-Host "INICIANDO PROTOCOLO A2A..." -ForegroundColor Yellow
    Write-Host "   1. Generando archivo de instrucciones..." -NoNewline
    $A2APath = "$PSScriptRoot\.claude\A2A_TASK.md"
    $content = "# Tarea Orquestada A2A`r`n`r`nObjetivo: $Task`r`n`r`nInstrucciones: Sigue el protocolo en .claude/prompts/a2a-protocol.md"
    Set-Content $A2APath $content -Encoding UTF8
    Write-Host " OK" -ForegroundColor Green
    
    Write-Host "   2. Invocando inteligencia colectiva..." -ForegroundColor Gray
    Write-Host ""
    Write-Host "   >>> COPILOTO: Por favor, lee .claude/A2A_TASK.md y ejecuta el ciclo REC." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Presiona ENTER para volver al menu mientras el agente trabaja..."
    Read-Host
}


function Main {
    do {
        Clear-Host
        Show-FactoryBanner
        Show-MainMenu
        $option = Read-Host
        
        switch ($option.ToUpper()) {
            'N' { New-SaaSClient }
            'E' { Edit-ExistingProject }
            'W' { Configure-Webhooks }
            'L' { List-Projects }
            'S' { Start-Dev }
            'B' { Build-Local }
            'V' { Build-AndVerify }
            'D' { Deploy-ToVercel }
            'M' { Deploy-Manual }
            'G' { Save-AndPushGit }
            'I' { Invoke-Guardian }
            'A' { Invoke-Orchestration }
            'T' { New-PWATenant }
            'U' { Create-User }
            'Y' { Deploy-LandingSynergos }
            'X' { 
                Write-Host ""
                Write-Host "Hasta pronto!" -ForegroundColor Green
                return 
            }
            default { Write-Host "Opcion invalida" -ForegroundColor Red; Start-Sleep 1 }
        }
        
        if ($option.ToUpper() -ne 'X') {
            Write-Host ""
            Write-Host "Presiona ENTER para volver al menu..."
            Read-Host
        }
    } while ($true)
}

Main

