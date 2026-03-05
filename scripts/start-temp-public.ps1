$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $false

$container = "imperium-site-tunnel"

docker rm -f $container *> $null
$null = docker run -d --name $container cloudflare/cloudflared:latest tunnel --no-autoupdate --url http://host.docker.internal:3000
Start-Sleep -Seconds 5

$logs = cmd /c "docker logs --tail 120 $container 2>&1"
$url = ($logs | Select-String -Pattern "https://[a-z0-9-]+\.trycloudflare\.com" -AllMatches).Matches.Value | Select-Object -Last 1

if (-not $url) {
  Write-Host "Nao foi possivel extrair a URL do tunnel. Veja logs:"
  $logs
  exit 1
}

Write-Host "TUNNEL_URL=$url"
Write-Host "LANDING=$url"
Write-Host "PAINEL_LOGIN=$url/tracking/login"
