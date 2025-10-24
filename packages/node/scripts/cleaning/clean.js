#!/usr/bin/env node

// SPDX-License-Identifier: Apache-2.0
// Copyright © 2025 Octovel

import { existsSync, rmSync } from 'node:fs';

const OUTPUTS = [`${process.cwd()}/build/index.js`, `${process.cwd()}/build/index.js.map`, `${process.cwd()}/build/index.cjs`, `${process.cwd()}/build/index.cjs.map`, `${process.cwd()}/build/index.d.ts`, `${process.cwd()}/build/index.d.cts`]

const Y = '\x1b[1;33m'
const G = '\x1b[1;32m'
const R = '\x1b[1;31m'
const X = '\x1b[0m'

const info = m => console.log(`${Y}[DEBUG]${X} ${m}`)
const ok = m => console.log(`${G}[CLEAN]${X} ${m}`)
const err = m => console.error(`${R}[CLEAN]${X} ${m}`)

ok('The cleaning process has started.\n')

info(`${Y}Cleaning previous build files...${X}`)
try {
for (const f of OUTPUTS) {
  if (existsSync(f)) {
    rmSync(f, { force: true })
    console.log(` ${Y}- ${X}${Y}${f}${X} ${R}(deleted)${X}`)
    }
  }
  console.log('')
} catch (e) {
  const msg = e && e.stderr ? e.stderr.toString() : (e && e.message ? e.message : 'Cleaning failed.')
  err(msg)
  process.exit(1)
}

ok(`The cleaning process has finished successfully!`)
process.exit(0)
