#!/usr/bin/env pwsh

# SPDX-License-Identifier: Apache-2.0
# Copyright © 2025 Octovel

param (
  [Parameter(Mandatory = $false)]
  [System.String] $ScriptPath = "./source/index.ts",

  [Parameter(Mandatory = $false)]
  [System.Management.Automation.SwitchParameter] $Silent,

  [Parameter(Mandatory = $false)]
  [System.Management.Automation.SwitchParameter] $Clean
)

# Output files
[System.Collections.Generic.List[System.String]] $OutputPath = @(
  "./build/index.js",
  "./build/index.js.map",
  "./build/index.cjs",
  "./build/index.cjs.map",
  "./build/index.d.ts",
  "./build/index.d.cts"
) ;

function Write-Info([System.String] $Message) {
  Write-Host "[DEBUG] " -ForegroundColor Yellow -NoNewline ;
  Write-Host $Message -ForegroundColor Yellow ;
}

function Write-Success([System.String] $Message) {
  Write-Host "[BUILD] " -ForegroundColor Green -NoNewline ;
  Write-Host $Message ;
}

function Write-ErrorMessage([System.String] $Message) {
  Write-Host "[ERROR] " -ForegroundColor Red -NoNewline ;
  Write-Host $Message ;
}

if (-not (Test-Path $ScriptPath)) {
  Write-ErrorMessage "Script path '$ScriptPath' does not exist." ;
  return ;
}

# Clean previous build files
if ($Clean) {
  Write-Info "Cleaning previous build files..." ;
  foreach ($file in $OutputPath) {
    if (Test-Path $file) {
      Remove-Item $file -Force ;
      Write-Host " - " -ForegroundColor Red -NoNewline ;
      Write-Host $file -NoNewline -ForegroundColor Yellow ;
      Write-Host " (deleted)" -ForegroundColor Red ;
    }
  }
  Write-Host "" ;
}

Write-Success "Starting build for '$ScriptPath'..." ;

try {
  if ($Silent) {
    pnpm tsup $ScriptPath > $null 2>&1 ;
  } else {
    pnpm tsup $ScriptPath ;
  }

  Write-Success "Build completed successfully!`n" ;
  Write-Info "Generated files:" ;

  # Check generated files
  foreach ($file in $OutputPath) {
    if (Test-Path $file) {
      Write-Host " + " -ForegroundColor Green -NoNewline ;
      Write-Host $file -NoNewline -ForegroundColor Yellow ;
      if (Test-Path $file) {
        Write-Host " (generated)" -ForegroundColor Green ;
      } else {
        Write-Host " (missing)" -ForegroundColor Red ;
      }
    } else {
      Write-Host "- " -ForegroundColor Red -NoNewline ;
      Write-Host $file -NoNewline ;
      Write-Host " (missing)" -ForegroundColor Red ;
    }
  }
} catch {
  Write-ErrorMessage "Build failed: $_" ;
}