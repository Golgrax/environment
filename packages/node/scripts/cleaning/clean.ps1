#!/usr/bin/env pwsh

# SPDX-License-Identifier: Apache-2.0
# Copyright © 2025 Octovel

[System.Collections.Generic.List[String]] $OutputPaths = @(
  "$PWD/build/index.js",
  "$PWD/build/index.js.map",
  "$PWD/build/index.cjs",
  "$PWD/build/index.cjs.map",
  "$PWD/build/index.d.ts",
  "$PWD/build/index.d.cts"
) ;

function Write-Info([System.String] $Message) {
  Write-Host "[DEBUG] " -ForegroundColor Yellow -NoNewline ;
  Write-Host $Message -ForegroundColor Yellow ;
}

function Write-Success([System.String] $Message) {
  Write-Host "[CLEAN] " -ForegroundColor Green -NoNewline ;
  Write-Host $Message ;
}

function Write-ErrorMessage([System.String] $Message) {
  Write-Host "[ERROR] " -ForegroundColor Red -NoNewline ;
  Write-Host $Message ;
}

[System.Collections.Generic.List[String]] $MissingFiles = @(
  $OutputPaths | Where-Object { -not (Test-Path $_) }
) ;

if ($MissingFiles.Count -eq $OutputPaths.Count) {
  Write-Host "`n" -NoNewline ; # newline for aesthetic
  Write-ErrorMessage "No output files were found to delete." ;
  exit 1 ;
}

try {
  $ErrorActionPreference = 'Stop' ;
  
  Write-Success "The cleaning process has started.`n" ;
  
  Write-Info "Cleaning previous build files..." ;
  
  foreach ($file in $OutputPaths) {
  if (Test-Path $file) {
      try {
        Remove-Item -Path $file -Recurse -Force ;
        Write-Host " - " -ForegroundColor Green -NoNewline ;
        Write-Host $file -NoNewline -ForegroundColor Yellow ;
        Write-Host " (deleted)" -ForegroundColor Green ;
      } catch {
        Write-Host " ✗ " -ForegroundColor Red -NoNewline ;
        Write-Host $file -NoNewline -ForegroundColor Yellow ;
        Write-Host " (failed to delete)" -ForegroundColor Red ;
      }
    }
  }
  
  Write-Host "" ;
  
  Write-Success "The cleaning process has finished successfully!" ;
  exit 0 ;
} catch {
  Write-ErrorMessage "An error occurred: $_" ;
  exit 1 ;
}
