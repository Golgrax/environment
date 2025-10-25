#!/usr/bin/env bash

# SPDX-License-Identifier: Apache-2.0
# Copyright © 2025 Octovel

# Get the absolute path of the directory this script lives in
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"

# Reference paths RELATIVE TO THE SCRIPT, not the current working directory
SCRIPT_PATH="${SCRIPT_DIR}/../../source/index.ts"
OUTPUT_DIR="${SCRIPT_DIR}/../../build"
OUTPUT_PATHS=(
  "${OUTPUT_DIR}/index.js"
  "${OUTPUT_DIR}/index.js.map"
  "${OUTPUT_DIR}/index.cjs"
  "${OUTPUT_DIR}/index.cjs.map"
  "${OUTPUT_DIR}/index.d.ts"
  "${OUTPUT_DIR}/index.d.cts"
)

YELLOW="\033[1;33m"
GREEN="\033[1;32m"
RED="\033[1;31m"
RESET="\033[0m"

write_info() {
  echo -e "${YELLOW}[DEBUG]${RESET} $1"
}

write_success() {
  echo -e "${GREEN}[BUILD]${RESET} $1"
}

write_error() {
  echo -e "${RED}[BUILD]${RESET} $1"
}

build_script() {
  local silent=false
  local clean=false

  for arg in "$@"; do
    case $arg in
      --silent) silent=true ;;
      --clean) clean=true ;;
    esac
  done

  if [ ! -f "$SCRIPT_PATH" ]; then
    write_error "Script path '$SCRIPT_PATH' does not exist."
    exit 1
  fi

  if [ "$clean" = true ]; then
    write_info "Cleaning previous build files..."
    for file in "${OUTPUT_PATHS[@]}"; do
      if [ -f "$file" ]; then
        rm -f "$file"
        echo -e " ${YELLOW}- ${RESET}${file} ${RED}(deleted)${RESET}"
      fi
    done
    echo ""
  fi

  write_success "Starting build for '$SCRIPT_PATH'..."

  if [ "$silent" = true ]; then
    pnpm tsup "$SCRIPT_PATH" > /dev/null 2>&1
  else
    pnpm tsup "$SCRIPT_PATH"
  fi

  if [ $? -eq 0 ]; then
    write_success "Build completed successfully!"
    echo ""
    write_info "Generated files:"
    for file in "${OUTPUT_PATHS[@]}"; do
      if [ -f "$file" ]; then
        echo -e " ${GREEN}+ ${RESET}${file} ${GREEN}(generated)${RESET}"
      else
        echo -e " ${RED}- ${RESET}${file} ${RED}(missing)${RESET}"
      fi
    done
  else
    write_error "Build failed."
    exit 1
  fi
}

build_script "$@"
