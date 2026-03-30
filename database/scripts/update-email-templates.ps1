# Supabase メールテンプレートを Management API で一括更新
# 実行前: $env:SUPABASE_ACCESS_TOKEN = "sbp_xxx"
# 参考: https://supabase.com/docs/guides/auth/auth-email-templates

$ErrorActionPreference = "Stop"
$projectRef = $env:SUPABASE_PROJECT_REF
if (-not $projectRef) { $projectRef = "yawzyrzfbphxrthlrzjg" }

$token = $env:SUPABASE_ACCESS_TOKEN
if (-not $token -or $token -notmatch '^sbp_') {
    Write-Host "ERROR: SUPABASE_ACCESS_TOKEN is not set or invalid." -ForegroundColor Red
    Write-Host '  Get it from: https://supabase.com/dashboard/account/tokens' -ForegroundColor Yellow
    Write-Host '  $env:SUPABASE_ACCESS_TOKEN = "sbp_xxxx"' -ForegroundColor Yellow
    exit 1
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$templatesDir = Join-Path (Split-Path -Parent (Split-Path -Parent $scriptDir)) "docs\deployment\supabase_email_templates"

$confirmPath = Join-Path $templatesDir "01_confirm_signup.html"
$recoveryPath = Join-Path $templatesDir "02_reset_password.html"
$emailChangePath = Join-Path $templatesDir "03_change_email.html"

$subjectsPath = Join-Path $templatesDir "subjects.json"
foreach ($p in @($confirmPath, $recoveryPath, $emailChangePath, $subjectsPath)) {
    if (-not (Test-Path $p)) {
        Write-Host "ERROR: File not found: $p" -ForegroundColor Red
        exit 1
    }
}

$confirmBody = Get-Content -Path $confirmPath -Raw -Encoding UTF8
$recoveryBody = Get-Content -Path $recoveryPath -Raw -Encoding UTF8
$emailChangeBody = Get-Content -Path $emailChangePath -Raw -Encoding UTF8

$subjects = Get-Content -Path $subjectsPath -Raw -Encoding UTF8 | ConvertFrom-Json

$body = @{
    mailer_subjects_confirmation = $subjects.confirmation
    mailer_templates_confirmation_content = $confirmBody
    mailer_subjects_recovery = $subjects.recovery
    mailer_templates_recovery_content = $recoveryBody
    mailer_subjects_email_change = $subjects.email_change
    mailer_templates_email_change_content = $emailChangeBody
}

$json = $body | ConvertTo-Json -Depth 10 -Compress
$uri = "https://api.supabase.com/v1/projects/$projectRef/config/auth"

Write-Host "Updating email templates for project $projectRef..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri $uri -Method Patch -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type"  = "application/json"
    } -Body ([System.Text.Encoding]::UTF8.GetBytes($json))
    Write-Host "SUCCESS: Email templates updated." -ForegroundColor Green
    Write-Host "  - Confirm signup" -ForegroundColor Gray
    Write-Host "  - Reset password" -ForegroundColor Gray
    Write-Host "  - Change email address" -ForegroundColor Gray
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host $responseBody -ForegroundColor Red
    }
    exit 1
}
