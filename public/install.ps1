# Install ACRYL Control Center on Windows 10 or 11 (x64 or arm64), from its latest release, with one line in PowerShell:
#
#   irm https://acryl.dev/install.ps1 | iex
#
# A brand-new computer ends with a working app: if git is missing (the app keeps versions, snapshots and shares with it) it is installed first, with
# winget, for this user only. No administrator, Node or npm: the app carries its own and installs for this user only (%LOCALAPPDATA%\Programs\ACRYL Control Center,
# with a Start menu entry). The download is checked against the sha256 GitHub publishes for the release asset, and nothing is installed when
# it differs. Running it again updates to the latest release; your apps and data live in %USERPROFILE%\.acryl and stay.
#
# Settings (environment): ACRYL_VERSION=v0.2.19   a release tag instead of the latest
#                         ACRYL_NO_LAUNCH=1         install, do not start
#                         ACRYL_YES=1               accepted for unattended runs; Windows asks nothing (git is installed for you only, no administrator)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
function Say($text) { Write-Host "acryl: $text" }

$repo = 'acrylblends/63-acryl-control-center'
$name = 'ACRYL Control Center'
$arch = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64' -or $env:PROCESSOR_ARCHITEW6432 -eq 'ARM64') { 'arm64' } else { 'x64' }
if (-not [Environment]::Is64BitOperatingSystem) { throw 'acryl: only 64-bit Windows is built' }
$asset = "ACRYL-Control-Center-win-$arch.exe"

# ---- What the app needs besides itself: git. Never fatal: the app starts without it.
function Update-SessionPath {
  # What the installers of this machine and user put on PATH, then what this session already had (nothing this session added is lost).
  $fresh = @([Environment]::GetEnvironmentVariable('Path', 'Machine'), [Environment]::GetEnvironmentVariable('Path', 'User'), $env:Path) | Where-Object { $_ }
  $env:Path = (($fresh -join ';') -split ';' | Where-Object { $_ } | Select-Object -Unique) -join ';'
}
function Test-Git {
  if (Get-Command git -ErrorAction SilentlyContinue) { return $true }
  foreach ($dir in @("$env:ProgramFiles\Git\cmd", "${env:ProgramFiles(x86)}\Git\cmd", "$env:LOCALAPPDATA\Programs\Git\cmd")) {
    if (Test-Path (Join-Path $dir 'git.exe')) { $env:Path = "$env:Path;$dir"; return $true }
  }
  return $false
}
if (Test-Git) { Say "git is there ($(git --version))" }
elseif (Get-Command winget -ErrorAction SilentlyContinue) {
  Say 'git is not installed: installing Git for Windows with winget, for you only (no administrator)'
  & winget install --id Git.Git -e --scope user --silent --accept-source-agreements --accept-package-agreements
  Update-SessionPath
  if (Test-Git) { Say "git is there ($(git --version))" }
  else { Say 'winget could not install git: going on without it. Install it from https://git-scm.com/download/win, then versions and sharing work' }
}
else { Say 'git is not installed and winget is not on this computer: going on without it. Install git from https://git-scm.com/download/win, then versions and sharing work' }

$api = if ($env:ACRYL_VERSION) { "https://api.github.com/repos/$repo/releases/tags/$($env:ACRYL_VERSION)" } else { "https://api.github.com/repos/$repo/releases/latest" }

$work = Join-Path ([IO.Path]::GetTempPath()) ('acryl-install-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $work | Out-Null
try {
  $release = Invoke-RestMethod -UseBasicParsing -Uri $api -Headers @{ 'User-Agent' = 'acryl-install' }
  $entry = $release.assets | Where-Object { $_.name -eq $asset } | Select-Object -First 1
  if (-not $entry) { throw "acryl: release $($release.tag_name) has no $asset" }
  if (-not ($entry.digest -match '^sha256:([0-9a-f]+)$')) { throw "acryl: GitHub gives no checksum for $asset in $($release.tag_name); nothing was installed" }
  $want = $Matches[1]

  Say "downloading $name $($release.tag_name) ($asset)"
  $file = Join-Path $work $asset
  Invoke-WebRequest -UseBasicParsing -Uri $entry.browser_download_url -OutFile $file
  $got = (Get-FileHash -Algorithm SHA256 $file).Hash.ToLower()
  if ($want -ne $got) { throw "acryl: the download is not the release's file (sha256 $got, expected $want); nothing was installed" }
  Say 'checksum ok'

  # The installer installs for this user only, silently; it replaces an older version in place.
  $process = Start-Process -FilePath $file -ArgumentList '/S' -Wait -PassThru
  if ($process.ExitCode -ne 0) { throw "acryl: the installer ended with code $($process.ExitCode)" }
  # Where it went: the installer keeps an earlier install's folder, so the folder is read from its own uninstall entry.
  $entryKey = Get-ChildItem 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall' | ForEach-Object { Get-ItemProperty $_.PSPath } |
    Where-Object { $_.DisplayName -like "$name*" -and $_.UninstallString } | Select-Object -First 1
  $dir = if ($entryKey -and $entryKey.InstallLocation) { $entryKey.InstallLocation }
         elseif ($entryKey) { Split-Path ($entryKey.UninstallString -replace '^"([^"]+)".*$', '$1') }
         else { Join-Path $env:LOCALAPPDATA "Programs\$name" }
  $exe = Join-Path $dir "$name.exe"
  if (-not (Test-Path $exe)) { throw "acryl: $exe is not there after the installer ran" }
  Say "installed $exe (Start menu: $name)"
  if ($env:ACRYL_NO_LAUNCH -ne '1') { Start-Process -FilePath $exe }
  Say 'done'
}
finally {
  Remove-Item -Recurse -Force $work -ErrorAction SilentlyContinue
}
