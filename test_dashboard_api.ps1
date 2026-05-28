$body = @{
    email = "alice@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
$token = $loginResponse.token

Write-Host "OK Token obtained"
Write-Host ""
Write-Host "Testing Dashboard API..."

try {
    $dashboardResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/invoices/stats/dashboard" -Headers @{"Authorization"="Bearer $token"}
    Write-Host "OK Dashboard Stats:"
    $dashboardResponse | ConvertTo-Json
} catch {
    Write-Host "ERROR Dashboard: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "Testing Low Stock Products API..."
try {
    $productsResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/products/low-stock" -Headers @{"Authorization"="Bearer $token"}
    Write-Host "OK Low Stock Products:"
    $productsResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "ERROR Products: $($_.Exception.Message)"
}
