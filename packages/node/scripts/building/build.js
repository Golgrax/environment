#!/usr/bin/env node

// SPDX-License-Identifier: Apache-2.0
// Copyright © 2025 Octovel

import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';

const SCRIPT_PATH = './source/index.ts'
const OUTPUTS = ['./build/index.js', './build/index.js.map', './build/index.cjs', './build/index.cjs.map', './build/index.d.ts', './build/index.d.cts']

const Y = '\x1b[1;33m'
const G = '\x1b[1;32m'
const R = '\x1b[1;31m'
const X = '\x1b[0m'

const info = m => console.log(`${Y}[DEBUG]${X} ${m}`)
const ok = m => console.log(`${G}[BUILD]${X} ${m}`)
const err = m => console.error(`${R}[BUILD]${X} ${m}`)

const args = process.argv.slice(2)
const silent = args.includes('--silent')
const clean = args.includes('--clean')

if (!existsSync(SCRIPT_PATH)) {
  err(`Script path '${SCRIPT_PATH}' does not exist.`)
  process.exit(1)
}

ok('The building process has started.\n')

if (clean) {
  info(`${Y}Cleaning previous build files...${X}`)
  for (const f of OUTPUTS) {
    if (existsSync(f)) {
      rmSync(f, { force: true })
      console.log(` ${Y}- ${X}${Y}${f}${X} ${R}(deleted)${X}`)
    }
  }
  console.log('')
}

ok(`Starting build for '${SCRIPT_PATH}'...`)

try {
  const cmd = `pnpm tsup ${SCRIPT_PATH}`
  execSync(cmd, { stdio: silent ? 'ignore' : 'inherit', cwd: process.cwd(), env: process.env })
  ok('Build completed successfully!')
  console.log('')
  info(`${Y}Generated files:${X}`)
  for (const f of OUTPUTS) {
    if (existsSync(f)) {
      console.log(` ${G}+ ${X}${Y}${f}${X} ${G}(generated)${X}`)
    } else {
      console.log(` ${R}- ${X}${Y}${f}${X} ${R}(missing)${X}`)
    }
  }
  process.exit(0)
} catch (e) {
  const msg = e && e.stderr ? e.stderr.toString() : (e && e.message ? e.message : 'Build failed.')
  err(msg)
  process.exit(1)
}
