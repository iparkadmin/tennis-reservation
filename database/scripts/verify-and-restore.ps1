# Supabase restore: verify tables, run 00_full_setup_fresh.sql if needed
# No Node.js required - PowerShell only
# Set token: $env:SUPABASE_ACCESS_TOKEN = "sbp_xxx"

$ErrorActionPreference = "Stop"
$token = $env:SUPABASE_ACCESS_TOKEN
$projectRef = $env:SUPABASE_PROJECT_REF
if (-not $projectRef) { $projectRef = "yawzyrzfbphxrthlrzjg" }

if (-not $token -or $token -notmatch '^sbp_') {
    Write-Host "ERROR: SUPABASE_ACCESS_TOKEN is not set or invalid." -ForegroundColor Red
    Write-Host "This is NOT anon key or service_role key." -ForegroundColor Yellow
    Write-Host "Get Personal Access Token from: https://supabase.com/dashboard/account/tokens"
    Write-Host "  (Account menu -> Account -> Access Tokens)"
    Write-Host ""
    Write-Host "Then run:" -ForegroundColor Cyan
    Write-Host '  $env:SUPABASE_ACCESS_TOKEN = "sbp_xxxx"'
    Write-Host '  .\database\scripts\verify-and-restore.ps1'
    exit 1
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$supabaseDir = Join-Path (Split-Path -Parent $scriptDir) "supabase"

function Invoke-SupabaseQuery {
    param([string]$Sql)
    $url = "https://api.supabase.com/v1/projects/$projectRef/database/query"
    $body = @{ query = $Sql } | ConvertTo-Json
    try {
        return Invoke-RestMethod -Uri $url -Method Post `
            -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" } `
            -Body $body `
            -ContentType "application/json; charset=utf-8"
    } catch {
        Write-Host "API Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Message -match "JWT could not be decoded") {
            Write-Host "Hint: Use Personal Access Token (sbp_xxx), NOT anon/service_role key." -ForegroundColor Yellow
            Write-Host "Get it from: https://supabase.com/dashboard/account/tokens"
        }
        throw
    }
}

Write-Host "=== Supabase Restore ===" -ForegroundColor Cyan
Write-Host "Project: $projectRef"

$checkSql = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profiles', 'courts', 'reservations', 'audit_logs') ORDER BY table_name;"

try {
    $r = Invoke-SupabaseQuery -Sql $checkSql
} catch {
    Write-Host "Failed to connect. Check your token." -ForegroundColor Red
    exit 1
}
# API returns { result: [...], error: null } or { result: [...], error: [] } on success
# Only treat as error when error is a non-empty string
$hasError = $r -and $r.error -and ($r.error -is [string]) -and ([string]$r.error).Trim() -ne ""
if ($hasError) {
    Write-Host "Error: $($r.error)" -ForegroundColor Red
    Write-Host "Full response: $($r | ConvertTo-Json -Depth 3)"
    exit 1
}
if (-not $r) { Write-Host "No response from API"; exit 1 }

$tables = $r.result
$count = 0
if ($null -ne $tables) {
    if ($tables -is [array]) { $count = $tables.Count } else { $count = 1 }
}
Write-Host "Tables found: $count / 4"

if ($count -lt 4) {
    Write-Host "Restoring database..." -ForegroundColor Yellow
    $setupPath = Join-Path $supabaseDir "00_full_setup_fresh.sql"
    if (-not (Test-Path $setupPath)) { Write-Host "Not found: $setupPath"; exit 1 }
    $setupSql = Get-Content -Path $setupPath -Raw -Encoding UTF8
    $r2 = Invoke-SupabaseQuery -Sql $setupSql
    if ($r2 -and $r2.error) {
        Write-Host "Error: $($r2.error)" -ForegroundColor Red
        Write-Host "Full response: $($r2 | ConvertTo-Json -Depth 3)"
        exit 1
    }
    Write-Host "Restore done." -ForegroundColor Green
} else {
    Write-Host "Skip (tables exist)" -ForegroundColor Green
}

Write-Host "Done. Set Auth/Email templates in Supabase Dashboard."
Write-Host "See: docs/deployment/SUPABASE_RESTORE_CHECKLIST.md"
