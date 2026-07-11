# Sets Android SDK / Java paths for this machine, then runs Expo CLI.
param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Args
)

$env:EXPO_TV = "1"
$env:ANDROID_HOME = "K:\Android\Sdk"
$env:ANDROID_SDK_ROOT = "K:\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot"
$env:Path = @(
  "$env:ANDROID_HOME\platform-tools",
  "$env:ANDROID_HOME\emulator",
  "$env:ANDROID_HOME\cmdline-tools\latest\bin",
  $env:Path
) -join ";"

$localProps = Join-Path $PSScriptRoot "..\android\local.properties"
if (Test-Path (Split-Path $localProps)) {
  "sdk.dir=K\:\\Android\\Sdk" | Set-Content -Path $localProps -Encoding ASCII
}

Write-Host "ANDROID_HOME=$env:ANDROID_HOME"
Write-Host "JAVA_HOME=$env:JAVA_HOME"

& npx expo @Args
exit $LASTEXITCODE
