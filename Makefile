.PHONY: build-node
.SILENT: build-node

CLEAN ?= false
SILENT ?= false

# Parse flags into an appendable string
FLAGS := $(if $(filter true,$(CLEAN)),--clean) $(if $(filter true,$(SILENT)),--silent)

# Infer the build command for the node implementation
BUILD_NODE_CMD := bash ./scripts/building/build.bash $(FLAGS)

# Build the node implementation
build-node:
	@cd ./packages/node && $(BUILD_NODE_CMD)
