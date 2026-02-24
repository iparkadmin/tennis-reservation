# Supabase Management API で SQL を実行する PowerShell スクリプト
# Node.js がなくても実行可能
#
# 使い方:
#   $env:SUPABASE_ACCESS_TOKEN = "sbp_xxx"
#   $env:SUPABASE_PROJECT_REF = "yawzyrzfbphxrthlrzjg"
#   .\run-sql-via-api.ps1 -SqlFile "..\supabase\00_verify_restore_status.sql"

param(
    [Parameter(Mandatory = $true)]
    [string]$SqlFile
)

$token = $env:SUPABASE_ACCESS_TOKEN
$projectRef = $env:SUPABASE_PROJECT_REF
if (-not $projectRef) { $projectRef = "yawzyrzfbphxrthlrzjg" }

if (-not $token -or $token -notmatch '^sbp_') {
    Write-Error "SUPABASE_ACCESS_TOKEN を設定してください。https://supabase.com/dashboard/account/tokens で取得"
    exit 1
}

$absPath = $SqlFile
if (-not [System.IO.Path]::IsPathRooted($SqlFile)) {
    $absPath = Join-Path $PSScriptRoot $SqlFile
}
if (-not (Test-Path $absPath)) {
    $absPath = Join-Path (Get-Location) $SqlFile
}
if (-not (Test-Path $absPath)) {
    Write-Error "SQL ファイルが見つかりません: $SqlFile"
    exit 1
}

$sql = Get-Content -Path $absPath -Raw -Encoding UTF8
$url = "https://api.supabase.com/v1/projects/$projectRef/database/query"
$body = @{ query = $sql } | ConvertTo-Json

Write-Host "Supabase Management API で SQL を実行中..." -ForegroundColor Cyan
Write-Host "Project: $projectRef"
Write-Host "File: $absPath"
Write-Host "---"

try {
    $response = Invoke-RestMethod -Uri $url -Method Post `
        -Headers @{
            Authorization = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $body `
        -ContentType "application/json; charset=utf-8"

    if ($response.result) {
        Write-Host "Result:" -ForegroundColor Green
        $response.result | ConvertTo-Json -Depth 10
    }
    if ($response.error) {
        Write-Error "Error: $($response.error)"
        exit 1
    }
} catch {
    Write-Error "Failed: $_"
    exit 1
}

Write-Host "---"
Write-Host "Done." -ForegroundColor Green
