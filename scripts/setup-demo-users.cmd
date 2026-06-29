@echo off
cd /d "%~dp0.."
node .\node_modules\prisma\build\index.js db push
node .\scripts\ensure-demo-users.js
@echo Demo users are ready.
@echo Admin: admin / admin123
@echo Faculty: udaykumar / udaykumar123
@echo Student: narasimha / narasimha123
