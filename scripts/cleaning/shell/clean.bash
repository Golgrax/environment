#!/usr/bin/env bash

# SPDX-License-Identifier: Apache-2.0
# Copyright © 2025 Octovel

OUTPUT_PATHS=(
  "${PWD}/build/index.js"
  "${PWD}/build/index.js.map"
  "${PWD}/build/index.cjs"
  "${PWD}/build/index.cjs.map"
  "${PWD}/build/index.d.ts"
  "${PWD}/build/index.d.cts"
)

YELLOW="\033[1;33m"
GREEN="\033[1;32m"
RED="\033[1;31m"
RESET="\033[0m"

write_info() {
  echo -e "${YELLOW}[DEBUG]${RESET} $1"
}

write_success() {
  echo -e "${GREEN}[CLEAN]${RESET} $1"
}

write_error() {
  echo -e "${RED}[CLEAN]${RESET} $1"
}

main() {
  write_success "The cleaning process has started.\n"

  write_info "${YELLOW}Cleaning previous build files...${RESET}"
  
  local deleted_count=0
  
  for file in "${OUTPUT_PATHS[@]}"; do
    if [[ -f "$file" || -d "$file" ]]; then
      rm -rf "$file"
      if [[ $? -eq 0 ]]; then
        echo -e " ${YELLOW}- ${RESET}${YELLOW}${file}${RESET} ${GREEN}(deleted)${RESET}"
        ((deleted_count++))
      else
        echo -e " ${RED}✗ ${RESET}${YELLOW}${file}${RESET} ${RED}(failed to delete)${RESET}"
      fi
    fi
  done
  
  echo ""
  
  if [[ $deleted_count -gt 0 ]]; then
    write_success "Successfully cleaned ${deleted_count} files/directories."
  else
    write_info "No files to clean. Everything is already clean!"
  fi
  
  write_success "The cleaning process has finished successfully!"
  return 0
}

# Run the main function
main "$@"
