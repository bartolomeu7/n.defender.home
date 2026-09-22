#Requires -RunAsAdministrator
<#
.SYNOPSIS
  Helper defensivo da Fase 2 — aplica config Sysmon e verifica saúde do endpoint.

.DESCRIPTION
  Não baixa binários. Sysmon e Wazuh Agent devem vir das páginas oficiais.
  Não executa exploit, scan ofensivo ou alteração em hosts de terceiros.
#>
[CmdletBinding()]
param(
  [switch]$ApplySysmon,
  [switch]$HealthOnly,
  [string]$SysmonConfig = "",
  [string]$NexusRoot = "C:\NexusDefender"
)

$ErrorActionPreference = "Stop"
$RepoConfig = Join-Path $PSScriptRoot "..\..\endpoint\sysmon\sysmon.xml"

function Write-Nexus($msg) {
  Write-Host "[NEXUS] $msg"
}

function Find-Sysmon {
  $candidates = @(
    (Join-Path $NexusRoot "Sysmon64.exe"),
    (Join-Path $NexusRoot "Sysmon.exe"),
    "$env:WINDIR\Sysmon64.exe",
    "$env:WINDIR\Sysmon.exe"
  )
  foreach ($c in $candidates) {
    if (Test-Path $c) { return $c }
  }
  $cmd = Get-Command sysmon64.exe -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $cmd = Get-Command sysmon.exe -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  return $null
}

function Get-ServiceState([string]$name) {
  $svc = Get-Service -Name $name -ErrorAction SilentlyContinue
  if (-not $svc) { return "absent" }
  return $svc.Status.ToString().ToLowerInvariant()
}

New-Item -ItemType Directory -Force -Path $NexusRoot | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $NexusRoot "evidence") | Out-Null

if (-not $SysmonConfig) {
  if (Test-Path $RepoConfig) { $SysmonConfig = (Resolve-Path $RepoConfig).Path }
  else { $SysmonConfig = Join-Path $NexusRoot "sysmon.xml" }
}

if ($ApplySysmon) {
  $sysmon = Find-Sysmon
  if (-not $sysmon) {
    Write-Nexus "Sysmon oficial não encontrado. Baixe em https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon"
    exit 2
  }
  if (-not (Test-Path $SysmonConfig)) {
    Write-Nexus "Config ausente: $SysmonConfig"
    exit 3
  }
  Copy-Item -Force $SysmonConfig (Join-Path $NexusRoot "sysmon.xml")
  $installed = Get-ServiceState "Sysmon64"
  if ($installed -eq "absent") { $installed = Get-ServiceState "Sysmon" }
  if ($installed -eq "absent") {
    Write-Nexus "Instalando perfil Sysmon (accepteula + config NEXUS)"
    & $sysmon -accepteula -i (Join-Path $NexusRoot "sysmon.xml")
  } else {
    Write-Nexus "Atualizando config Sysmon"
    & $sysmon -c (Join-Path $NexusRoot "sysmon.xml")
  }
}

Write-Nexus "Health check"
$report = [ordered]@{
  sysmon64      = Get-ServiceState "Sysmon64"
  sysmon        = Get-ServiceState "Sysmon"
  wazuh         = Get-ServiceState "WazuhSvc"
  sysmonBinary  = [bool](Find-Sysmon)
  configPresent = Test-Path (Join-Path $NexusRoot "sysmon.xml")
  nexusRoot     = Test-Path $NexusRoot
}
$report.GetEnumerator() | ForEach-Object { Write-Host ("  {0,-14} {1}" -f $_.Key, $_.Value) }

if ($report.wazuh -eq "absent") {
  Write-Nexus "Wazuh Agent não instalado. Use o MSI oficial: https://documentation.wazuh.com/current/"
}

if ($HealthOnly) { exit 0 }
exit 0
