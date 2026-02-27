# Vercel Deploy Hook でデプロイをトリガーするスクリプト
# 使い方:
#   1. Vercel ダッシュボードで Deploy Hook を作成
#   2. 環境変数または引数で URL を指定して実行
#   $env:VERCEL_DEPLOY_HOOK_URL = "https://api.vercel.com/v1/integrations/deploy/..."
#   .\trigger-vercel-deploy.ps1
# または:
#   .\trigger-vercel-deploy.ps1 -Url "https://api.vercel.com/v1/integrations/deploy/..."

param(
    [string]$Url = $env:VERCEL_DEPLOY_HOOK_URL
)

if (-not $Url) {
    Write-Host "Error: Deploy Hook URL is required." -ForegroundColor Red
    Write-Host "Set VERCEL_DEPLOY_HOOK_URL or pass -Url parameter." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Create a Deploy Hook in Vercel: Settings > Git > Deploy Hooks" -ForegroundColor Cyan
    exit 1
}

try {
    $response = Invoke-WebRequest -Uri $Url -Method POST -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    if ($json.job) {
        Write-Host "Deploy triggered successfully. Job ID: $($json.job.id)" -ForegroundColor Green
        Write-Host "Check Vercel dashboard for build progress."
    } else {
        Write-Host "Response: $($response.Content)"
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
