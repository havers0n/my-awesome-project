# Script to get JWT token from Supabase for testing
$supabaseUrl = "https://uxcsziylmyogvcqyyuiw.supabase.co"
$supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Y3N6aXlsbXlvZ3ZjcXl5dWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MjQxNDUsImV4cCI6MjA2NTIwMDE0NX0.V7E4FA8mFCggDjXgioTHAdsGqjsrasumZAKizs_H44o"

# Sign up a new test user
$signupBody = @{
    email = "test_user_$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
    password = "TestPassword123!"
} | ConvertTo-Json

$signupHeaders = @{
    "Content-Type" = "application/json"
    "apikey" = $supabaseAnonKey
}

Write-Host "Creating test user..."
try {
    $signupResponse = Invoke-WebRequest -Uri "$supabaseUrl/auth/v1/signup" -Method POST -Headers $signupHeaders -Body $signupBody
    $signupResult = $signupResponse.Content | ConvertFrom-Json
    
    Write-Host "User created successfully!"
    Write-Host "Email: $($signupBody | ConvertFrom-Json | Select-Object -ExpandProperty email)"
    Write-Host "JWT Token: $($signupResult.access_token)"
    Write-Host ""
    Write-Host "To use this token in API requests, add the following header:"
    Write-Host "Authorization: Bearer $($signupResult.access_token)"
    
    # Save token to file
    $signupResult.access_token | Out-File -FilePath "jwt_token.txt"
    Write-Host ""
    Write-Host "Token saved to jwt_token.txt"
    
} catch {
    Write-Host "Error creating user: $($_.Exception.Message)"
    
    # Try to sign in if user already exists
    Write-Host ""
    Write-Host "Trying to sign in with test credentials..."
    
    $signinBody = @{
        email = "danyputin123@gmail.com"
        password = "test123"  # You'll need to provide the correct password
    } | ConvertTo-Json
    
    try {
        $signinResponse = Invoke-WebRequest -Uri "$supabaseUrl/auth/v1/token?grant_type=password" -Method POST -Headers $signupHeaders -Body $signinBody
        $signinResult = $signinResponse.Content | ConvertFrom-Json
        
        Write-Host "Sign in successful!"
        Write-Host "JWT Token: $($signinResult.access_token)"
        Write-Host ""
        Write-Host "To use this token in API requests, add the following header:"
        Write-Host "Authorization: Bearer $($signinResult.access_token)"
        
        # Save token to file
        $signinResult.access_token | Out-File -FilePath "jwt_token.txt"
        Write-Host ""
        Write-Host "Token saved to jwt_token.txt"
        
    } catch {
        Write-Host "Sign in error: $($_.Exception.Message)"
        Write-Host "Please check the credentials or create a new user manually."
    }
}
