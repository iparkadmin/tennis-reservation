# iparkadmin への subtree push（.env.git.local の認証情報を使用）
# 使い方:
#   1. vault/.env.git.example を vault/.env.git.local にコピー
#   2. GITHUB_USERNAME と GITHUB_PAT を設定
#   3. .\push-iparkadmin.ps1

$ErrorActionPreference = "Stop"

# vault ルートの .env.git.local を探す
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$vaultRoot = Resolve-Path (Join-Path $scriptDir "../..")
$envFile = Join-Path $vaultRoot ".env.git.local"

if (-not (Test-Path $envFile)) {
    Write-Host "Error: $envFile がありません。" -ForegroundColor Red
    Write-Host "vault/.env.git.example を vault/.env.git.local にコピーし、GITHUB_USERNAME と GITHUB_PAT を設定してください。" -ForegroundColor Yellow
    exit 1
}

# .env.git.local を読み込み
$vars = @{}
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line -match "^([^#=]+)=(.*)$") {
        $vars[$matches[1].Trim()] = $matches[2].Trim().Trim('"').Trim("'")
    }
}

$user = $vars["GITHUB_USERNAME"]
$pat = $vars["GITHUB_PAT"]

if (-not $user -or -not $pat) {
    Write-Host "Error: .env.git.local に GITHUB_USERNAME と GITHUB_PAT を設定してください。" -ForegroundColor Red
    exit 1
}

# Git リポジトリのルート（vault の親）
$gitRoot = Split-Path -Parent $vaultRoot

# 認証付き URL
$authUrl = "https://${user}:${pat}@github.com/iparkadmin/tennis-reservation.git"

Write-Host "iparkadmin へ push します（約2分かかります）..." -ForegroundColor Cyan

Push-Location $gitRoot
try {
    # 一時的にリモート URL を認証付きに変更
    $originalUrl = git remote get-url iparkadmin 2>$null
    if (-not $originalUrl) {
        Write-Host "iparkadmin リモートがありません。追加します..." -ForegroundColor Yellow
        git remote add iparkadmin https://github.com/iparkadmin/tennis-reservation.git
        $originalUrl = "https://github.com/iparkadmin/tennis-reservation.git"
    }

    git remote set-url iparkadmin $authUrl
    try {
        git subtree push --prefix=vault/tennis-reservation iparkadmin main
        Write-Host "Push 完了。" -ForegroundColor Green
    } finally {
        # 認証情報を URL から削除して元に戻す
        git remote set-url iparkadmin $originalUrl
    }
} finally {
    Pop-Location
}
