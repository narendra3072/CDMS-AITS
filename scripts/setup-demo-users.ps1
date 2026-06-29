Set-Location $PSScriptRoot\..
node .\node_modules\prisma\build\index.js db push
node .\scripts\ensure-demo-users.js
Write-Host "Demo users are ready."
Write-Host "Admin: admin / admin123"
Write-Host "Faculty: udaykumar / udaykumar123"
Write-Host "Student: narasimha / narasimha123"
