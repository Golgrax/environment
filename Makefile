# SPDX-License-Identifier: Apache-2.0
# Copyright © 2025 Octovel

.PHONY: build/node clean/node
.SILENT: build/node clean/node

CLEAN ?= false
SILENT ?= false

# Parse flags into an appendable string
FLAGS := $(if $(filter true,$(CLEAN)),--clean) $(if $(filter true,$(SILENT)),--silent)

# Infer the build command for the node implementation
BUILD_NODE_CMD := bash ./scripts/building/build.bash $(FLAGS)
CLEAN_NODE_CMD := bash ./scripts/cleaning/clean.bash $(FLAGS)

#region Node Implementation
# Build the node implementation
build/node:
	@cd ./packages/node && $(BUILD_NODE_CMD)

# Clean the node build artifacts
clean/node:
	@cd ./packages/node && $(CLEAN_NODE_CMD)
#endregion Node Implementation
