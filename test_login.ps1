$body = @{
    email = "alice@example.com"
    password = "password123"
} | ConvertTo-Json

Write-Host "Testing login with credentials:"
Write-Host "Email: alice@example.com"
Write-Host "Password: password123"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body
    
    if ($response.success) {
        Write-Host "✅ LOGIN SUCCESSFUL!"
        Write-Host "Token: $($response.token.Substring(0,30))..."
        Write-Host "User: $($response.user.name) ($($response.user.email))"
    } else {
        Write-Host "❌ LOGIN FAILED: $($response.message)"
    }
} catch {
    Write-Host "❌ ERROR: $_"
    Write-Host "Backend may not be running on port 5000"
}
