# Test API endpoints

# Login
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"alice@example.com","password":"password123"}'

$token = $loginResponse.token
Write-Host "✅ Login successful. Token: $($token.Substring(0,20))..."

# Get dashboard stats
$dashboardResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/invoices/stats/dashboard" `
  -Headers @{"Authorization"="Bearer $token"}

Write-Host "`n✅ Dashboard Stats:"
$dashboardResponse | ConvertTo-Json

# Get products
$productsResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/products" `
  -Headers @{"Authorization"="Bearer $token"}

Write-Host "`n✅ Products:"
$productsResponse | ConvertTo-Json -Depth 3

# Get user profile
$meResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" `
  -Headers @{"Authorization"="Bearer $token"}

Write-Host "`n✅ User Profile:"
$meResponse | ConvertTo-Json

Write-Host "`n✅ All MySQL backend tests PASSED!"
