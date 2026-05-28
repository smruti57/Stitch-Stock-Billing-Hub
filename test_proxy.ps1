$body = @{
    email = "alice@example.com"
    password = "password123"
} | ConvertTo-Json

Write-Host "Testing frontend proxy to backend..."
Write-Host "URL: http://localhost:5173/api/auth/login"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5173/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
    
    Write-Host "✅ Response received from frontend:"
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "StatusCode: $($_.Exception.Response.StatusCode)"
    }
}
