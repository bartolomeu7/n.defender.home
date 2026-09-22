#Requires -RunAsAdministrator
<#
.SYNOPSIS
  Lê o serviço WireGuard local e grava gateway-status.json para o launcher.

.DESCRIPTION
  Não envia tráfego a alvos de terceiros. Não imprime chaves.
#>
[CmdletBinding()]
param(
  [string]$NexusRoot = "C:\NexusDefender",
  [string]$Peer = "gw-home",
  [string]$InterfaceName = "wg0",
  [ValidateSet("blocked", "tunneled", "unknown")]
  [string]$Ipv6Policy = "blocked",
  [switch]$AssumeDnsThroughTunnel
)

$ErrorActionPreference = "Stop"

function Get-ServiceState([string]$name) {
  $svc = Get-Service -Name $name -ErrorAction SilentlyContinue
  if (-not $svc) { return "absent" }
  return $svc.Status.ToString().ToLowerInvariant()
}

New-Item -ItemType Directory -Force -Path $NexusRoot | Out-Null

$svcNames = @(
  "WireGuardTunnel`$$InterfaceName",
  "WireGuardManager"
)
$tunnel = "absent"
foreach ($n in $svcNames) {
  $st = Get-ServiceState $n
  if ($st -ne "absent") { $tunnel = $st; break }
}

$enabled = $tunnel -eq "running"
$handshake = $enabled
$ks = $false
$conf = Join-Path $NexusRoot "$InterfaceName.conf"
if (Test-Path $conf) {
  $raw = Get-Content -Raw $conf
  if ($raw -match "AllowedIPs\s*=\s*0\.0\.0\.0/0") { $ks = $true }
}

$status = [ordered]@{
  enabled           = $enabled
  killSwitch        = $ks
  peer              = $Peer
  interface         = $InterfaceName
  observedExit      = $(if ($enabled) { "masked" } else { "isp" })
  handshakeOk       = $handshake
  dnsThroughTunnel  = [bool]$AssumeDnsThroughTunnel -or $enabled
  ipv6Policy        = $Ipv6Policy
  updatedAt         = (Get-Date).ToUniversalTime().ToString("o")
}

$out = Join-Path $NexusRoot "gateway-status.json"
($status | ConvertTo-Json) | Set-Content -Encoding utf8 $out
Write-Host "[NEXUS] $out"
Write-Host "[NEXUS] tunnel=$tunnel enabled=$enabled killSwitch=$ks"
if ($tunnel -eq "absent") {
  Write-Host "[NEXUS] Instale o cliente oficial: https://www.wireguard.com/install/"
}
