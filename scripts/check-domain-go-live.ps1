param(
  [Parameter(Mandatory = $false)]
  [string]$Domain = "imperiumpendente.online",

  [Parameter(Mandatory = $false)]
  [string]$ExpectedIp = ""
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Text)
  Write-Host "`n== $Text ==" -ForegroundColor Cyan
}

function Write-Ok {
  param([string]$Text)
  Write-Host "[OK] $Text" -ForegroundColor Green
}

function Write-Warn {
  param([string]$Text)
  Write-Host "[WARN] $Text" -ForegroundColor Yellow
}

function Write-Err {
  param([string]$Text)
  Write-Host "[ERRO] $Text" -ForegroundColor Red
}

function Resolve-ARecord {
  param([string]$Name)
  try {
    return Resolve-DnsName -Name $Name -Type A -ErrorAction Stop |
      Where-Object { $_.Type -eq "A" } |
      Select-Object -ExpandProperty IPAddress -Unique
  }
  catch {
    return @()
  }
}

function Resolve-CnameRecord {
  param([string]$Name)
  try {
    return Resolve-DnsName -Name $Name -Type CNAME -ErrorAction Stop |
      Where-Object { $_.Type -eq "CNAME" } |
      Select-Object -ExpandProperty NameHost -Unique
  }
  catch {
    return @()
  }
}

function Test-HttpEndpoint {
  param([string]$Url)

  $result = [ordered]@{
    Url = $Url
    Ok = $false
    Status = "-"
    Location = ""
    ContentType = ""
    ContentDisposition = ""
    BodySnippet = ""
    Error = ""
  }

  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 20
    $result.Ok = $true
    $result.Status = [string]$response.StatusCode
    $result.Location = [string]$response.Headers["Location"]
    $result.ContentType = [string]$response.Headers["Content-Type"]
    $result.ContentDisposition = [string]$response.Headers["Content-Disposition"]
    if ($response.Content) {
      $result.BodySnippet = $response.Content.Substring(0, [Math]::Min(250, $response.Content.Length))
    }
    return [pscustomobject]$result
  }
  catch {
    $webResponse = $_.Exception.Response
    if ($webResponse) {
      $result.Status = [string][int]$webResponse.StatusCode
      try {
        $result.Location = [string]$webResponse.Headers["Location"]
      }
      catch {}
      try {
        $result.ContentType = [string]$webResponse.Headers["Content-Type"]
        $result.ContentDisposition = [string]$webResponse.Headers["Content-Disposition"]
      }
      catch {}

      if ($result.Status -in @("200", "301", "302", "307", "308")) {
        $result.Ok = $true
      }
      else {
        $result.Error = $_.Exception.Message
      }
    }
    else {
      $result.Error = $_.Exception.Message
    }

    return [pscustomobject]$result
  }
}

Write-Step "Checagem DNS"
$rootA = @(Resolve-ARecord -Name $Domain)
$wwwName = "www.$Domain"
$wwwA = @(Resolve-ARecord -Name $wwwName)
$wwwCname = @(Resolve-CnameRecord -Name $wwwName)
$goDaddyForwardingIps = @("15.197.148.33", "3.33.130.190")

if ($rootA.Count -eq 0) {
  Write-Err "Dominio raiz $Domain sem A record (ou ainda sem propagacao)."
}
else {
  Write-Ok "A record de ${Domain}: $($rootA -join ', ')"
}

if ($wwwCname.Count -gt 0) {
  Write-Ok "CNAME de ${wwwName}: $($wwwCname -join ', ')"
}
elseif ($wwwA.Count -gt 0) {
  Write-Warn "www esta em A record ($($wwwA -join ', ')). Funciona, mas o recomendado e CNAME para @."
}
else {
  Write-Err "www sem CNAME/A (ou sem propagacao)."
}

if ($ExpectedIp) {
  if ($rootA -contains $ExpectedIp) {
    Write-Ok "A record do dominio raiz bate com IP esperado ($ExpectedIp)."
  }
  else {
    Write-Err "A record NAO bate com IP esperado ($ExpectedIp). Atual: $($rootA -join ', ')"
  }
}

$forwardingHitCount = ($rootA | Where-Object { $goDaddyForwardingIps -contains $_ }).Count
if ($forwardingHitCount -ge 1) {
  Write-Warn "Detectado encaminhamento/pagina padrao GoDaddy (IPs $($goDaddyForwardingIps -join ', ')). Para publicar seu site real, troque o A @ para o IP do seu servidor."
}

Write-Step "Checagem HTTP/HTTPS"
$checks = @(
  "https://$Domain",
  "https://$wwwName",
  "https://$Domain/tracking/login",
  "https://$Domain/tracking/admin/dashboard",
  "https://$Domain/tracking/admin/export.csv"
)

$results = foreach ($url in $checks) {
  Test-HttpEndpoint -Url $url
}

$results | Format-Table Url, Status, Location, ContentType, Ok -AutoSize

$loginResult = $results | Where-Object { $_.Url -eq "https://$Domain/tracking/login" } | Select-Object -First 1
$dashboardResult = $results | Where-Object { $_.Url -eq "https://$Domain/tracking/admin/dashboard" } | Select-Object -First 1
$exportResult = $results | Where-Object { $_.Url -eq "https://$Domain/tracking/admin/export.csv" } | Select-Object -First 1
$landingRedirectPattern = "/lander"

Write-Step "Resumo"
if ($loginResult -and $loginResult.Ok -and $loginResult.Status -eq "200") {
  if ($loginResult.BodySnippet -like "*$landingRedirectPattern*") {
    Write-Err "Dominio ainda aponta para pagina de redirecionamento externa (/lander), nao para seu servidor."
  }
  else {
    Write-Ok "Pagina de login do painel responde com 200."
  }
}
else {
  Write-Warn "Login do painel ainda nao esta com resposta esperada (200)."
}

if ($dashboardResult -and $dashboardResult.Status -eq "302" -and $dashboardResult.Location -like "*/tracking/login*") {
  Write-Ok "Dashboard exige autenticacao (302 para login)."
}
else {
  Write-Warn "Dashboard nao retornou 302 como esperado para area privada."
}

if ($exportResult -and $exportResult.Status -eq "302") {
  Write-Ok "Export CSV esta protegido (302 para login sem sessao)."
}
elseif ($exportResult -and $exportResult.Status -eq "200" -and $exportResult.ContentType -like "text/csv*") {
  Write-Warn "Export CSV respondeu 200 sem login. Verifique se o endpoint ficou publico."
}
else {
  Write-Warn "Export CSV nao retornou 302 sem sessao. Verificar protecao."
}

Write-Host "`nConcluido."
