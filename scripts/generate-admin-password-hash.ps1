param(
  [Parameter(Mandatory = $true)]
  [string]$Password
)

$ErrorActionPreference = "Stop"

if ($Password.Length -lt 10) {
  Write-Warning "Senha curta. Recomendo no minimo 10 caracteres."
}

$hash = node -e "const crypto=require('crypto'); const pwd=process.argv[1]; const salt=crypto.randomBytes(16).toString('hex'); const out=crypto.scryptSync(pwd, Buffer.from(salt,'hex'),64).toString('hex'); console.log('scrypt$'+salt+'$'+out);" "$Password"

Write-Output ("ADMIN_PASSWORD_HASH=" + $hash)
