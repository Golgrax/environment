# Version 0.0.5

### Changes

- removed `process/process.py`, it has no mirrors across other implementations, and its inclusion is unnecessary and provides no novel functionality, nor does it make any lower level interface simpler to use.

### Minor Changes

- added basic styling to python test files

# Version 0.0.4

### Minor Changes

- Simplified `ProcessController.is_running()` to use a polling method


# Version 0.0.3

## Additions

- Created initial implementation of ProcessController class and it's methods.
- Created respective dataclass and protocol to help with the above.
- Added changelog.

### Minor Changes

- Renamed dataclass folder to `dataclasses`, updated imports.
- Changed python project structural wording in readme from `implementation` to `module`.


# Version 0.0.2

## Additions

- Created first implementation of ProcessRegistry class and all its methods.
- Created ProcessInfo and ProcessInfoProtocol classes. The first is a dataclass and the latter is a structural contract for the dataclass implementation.

# Version 0.0.1

## Additions

- Pulled basic documentation into project.

# Version 0.0.0

## Additions

- Python module created.
