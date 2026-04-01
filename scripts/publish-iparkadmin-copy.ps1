# iparkadmin/tennis-reservation へ「ファイルコピー同期」して push する（コピー環境）
#
# git subtree を使わないため、vault モノレポの履歴は iparkadmin に載らない。
# GitHub Push Protection（履歴内の別ディレクトリの秘密検知）や non-fast-forward で
# subtree push が失敗するときの代替手段。
#
# 前提:
#   1. リポジトリルートの .env.git.example を .env.git.local にコピーし GITHUB_USERNAME / GITHUB_PAT を設定
#   2. iparkadmin/tennis-reservation を clone したローカルパスを用意
#
# 使い方:
#   cd tennis-reservation\scripts
#   .\publish-iparkadmin-copy.ps1 -ClonePath "C:\work\iparkadmin-tennis-reservation"
#
# 注意:
#   - コピー元に機密ファイルがあれば送られる。push 前に git status / diff で確認すること。
#   - /E のみ（ミラーではない）。vault 側で消したファイルは clone 側に残る場合がある。

param(
    [Parameter(Mandatory = $true)]
    [string]$ClonePath
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "../..")
$envFile = Join-Path $repoRoot ".env.git.local"
$sourceDir = Resolve-Path (Join-Path $repoRoot "tennis-reservation")

if (-not (Test-Path $envFile)) {
    Write-Host "Error: $envFile がありません。" -ForegroundColor Red
    Write-Host ".env.git.example を .env.git.local にコピーし、GITHUB_USERNAME と GITHUB_PAT を設定してください。" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path -LiteralPath $ClonePath)) {
    Write-Host "Error: ClonePath が存在しません: $ClonePath" -ForegroundColor Red
    exit 1
}
$cloneRoot = (Resolve-Path -LiteralPath $ClonePath).Path

if (-not (Test-Path (Join-Path $cloneRoot ".git"))) {
    Write-Host "Error: ClonePath に .git がありません（iparkadmin の clone 先を指定）: $cloneRoot" -ForegroundColor Red
    Write-Host "例: git clone https://github.com/iparkadmin/tennis-reservation.git C:\work\iparkadmin-tennis-reservation" -ForegroundColor Yellow
    exit 1
}

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

$authUrl = "https://${user}:${pat}@github.com/iparkadmin/tennis-reservation.git"
$originalUrl = git -C $cloneRoot remote get-url origin 2>$null
if (-not $originalUrl) {
    Write-Host "Error: clone 先に origin リモートがありません。" -ForegroundColor Red
    exit 1
}

Write-Host "コピー元: $sourceDir" -ForegroundColor Cyan
Write-Host "コピー先: $cloneRoot" -ForegroundColor Cyan

Push-Location $cloneRoot
try {
    git fetch origin 2>&1 | Out-Null
    git checkout main 2>&1 | Out-Null
    git pull --ff-only origin main 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "警告: git pull --ff-only origin main に失敗。競合や分岐の可能性。手動で整えてから再実行してください。" -ForegroundColor Yellow
        exit 1
    }
}
finally {
    Pop-Location
}

# /E: サブディレクトリ含む（ミラーは使わない）
# /XD: 除外ディレクトリ（複数はスペース区切りで 1 つの /XD の後に列挙）
& robocopy.exe $sourceDir $cloneRoot /E /FFT /DST /R:1 /W:1 /NFL /NDL /NJH /NJS /NP `
    /XD node_modules .next .vercel out dist build .turbo .swc coverage storybook-static

$rc = $LASTEXITCODE
if ($rc -ge 8) {
    Write-Host "Error: robocopy が失敗しました (exit $rc)" -ForegroundColor Red
    exit $rc
}

Push-Location $cloneRoot
try {
    git add -A
    $porcelain = git status --porcelain
    if (-not $porcelain) {
        Write-Host "変更なし。push は行いません。" -ForegroundColor Green
        exit 0
    }

    git commit -m "chore: sync tennis-reservation from vault (file copy)"
    git remote set-url origin $authUrl
    try {
        git push origin main
        Write-Host "iparkadmin main へ push 完了。Vercel（muramatsus-projects）のデプロイを確認してください。" -ForegroundColor Green
    }
    finally {
        git remote set-url origin $originalUrl
    }
}
finally {
    Pop-Location
}
