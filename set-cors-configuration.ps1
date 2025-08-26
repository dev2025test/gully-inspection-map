# Firebase Storage CORS Configuration Script
# PowerShell Version

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Firebase Storage CORS Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if gsutil is available
Write-Host "Checking if gsutil is available..." -ForegroundColor Yellow
try {
    $gsutilPath = Get-Command gsutil -ErrorAction Stop
    Write-Host "✅ gsutil found at: $($gsutilPath.Source)" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: gsutil is not installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Google Cloud SDK from:" -ForegroundColor Yellow
    Write-Host "https://cloud.google.com/sdk/docs/install-windows" -ForegroundColor Blue
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check authentication
Write-Host "Checking authentication..." -ForegroundColor Yellow
try {
    $authResult = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
    if ($authResult) {
        Write-Host "✅ Authenticated as: $authResult" -ForegroundColor Green
    } else {
        throw "No active authentication found"
    }
} catch {
    Write-Host "❌ ERROR: Not authenticated with Google Cloud" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run: gcloud auth login" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Setting CORS configuration for Firebase Storage..." -ForegroundColor Yellow
Write-Host "Bucket: gs://gullytest3.appspot.com" -ForegroundColor Gray
Write-Host "CORS file: cors.json" -ForegroundColor Gray
Write-Host ""

# Check if cors.json exists
if (-not (Test-Path "cors.json")) {
    Write-Host "❌ ERROR: cors.json file not found!" -ForegroundColor Red
    Write-Host "Make sure cors.json exists in the current directory." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Set CORS configuration
try {
    $result = gsutil cors set cors.json gs://gullytest3.appspot.com 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "SUCCESS: CORS configuration set!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your Firebase Storage bucket now allows:" -ForegroundColor White
        Write-Host "• Local development (localhost:8000, localhost:3000, etc.)" -ForegroundColor Gray
        Write-Host "• Production domains (Netlify, Firebase Hosting)" -ForegroundColor Gray
        Write-Host "• Image uploads and downloads" -ForegroundColor Gray
        Write-Host ""
    } else {
        throw "gsutil command failed"
    }
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "ERROR: Failed to set CORS configuration" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "1. Check your internet connection" -ForegroundColor Gray
    Write-Host "2. Verify you have permissions for the bucket" -ForegroundColor Gray
    Write-Host "3. Make sure cors.json file exists and is valid" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Error details:" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Verify CORS configuration
Write-Host "Verifying CORS configuration..." -ForegroundColor Yellow
Write-Host ""
try {
    gsutil cors get gs://gullytest3.appspot.com
} catch {
    Write-Host "⚠️ Warning: Could not verify CORS configuration" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CORS Configuration Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Test photo upload in your application" -ForegroundColor Gray
Write-Host "2. Check browser console for CORS errors" -ForegroundColor Gray
Write-Host "3. Verify photos are being saved to Firebase Storage" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to exit"
