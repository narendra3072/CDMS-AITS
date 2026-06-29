# Running The AITS Portal

## CMD

First-time setup:

```cmd
cd /d D:\CDMS-main
scripts\setup-db.cmd
```

Start the dev server:

```cmd
cd /d D:\CDMS-main
npm run dev
```

Shortcut: `scripts\run-dev.cmd`

## PowerShell

First-time setup:

```powershell
Set-Location D:\CDMS-main
.\scripts\setup-db.ps1
```

If PowerShell blocks local scripts, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-db.ps1
```

Start the dev server:

```powershell
Set-Location D:\CDMS-main
npm run dev
```

Shortcut: `.\scripts\run-dev.ps1`

The app runs at `http://localhost:3000`.

Default logins:

```text
admin / admin123
narasimha / narasimha123
uday.kumar / udaykumar123
```
