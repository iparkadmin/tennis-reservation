# utilizers table migration - Supabase Management API
# Usage: $env:SUPABASE_ACCESS_TOKEN = "sbp_xxx"; .\run-utilizers-migration.ps1

$token = $env:SUPABASE_ACCESS_TOKEN
$projectRef = $env:SUPABASE_PROJECT_REF
if (-not $projectRef) { $projectRef = "yawzyrzfbphxrthlrzjg" }

if (-not $token -or -not $token.StartsWith("sbp_")) {
    Write-Error "SUPABASE_ACCESS_TOKEN required. Get from https://supabase.com/dashboard/account/tokens"
    exit 1
}

$sqlPath = Join-Path $PSScriptRoot "..\supabase\migrations\21_utilizers_table.sql"
$sql = Get-Content -Path $sqlPath -Raw -Encoding UTF8
$url = "https://api.supabase.com/v1/projects/$projectRef/database/query"
$body = @{ query = $sql } | ConvertTo-Json

Write-Host "Running utilizers migration..."
try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    } -Body $body -ContentType "application/json; charset=utf-8"

    if ($response.error) {
        Write-Error "Error: $($response.error)"
        exit 1
    }
    Write-Host "Success. utilizers table created."
} catch {
    Write-Error "Failed: $_"
    exit 1
}
