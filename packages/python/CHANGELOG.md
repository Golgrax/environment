# Version 0.0.7

### Changes

- Renamed `user/user_environment.py` to `process/process_environment.py`, the behavior used here only relates to process environments, not user-level environment variables. user_environment will be implemented later.
- Added the functionality in ProcessEnvironment.get() to optionally return a default value if provided.
- Added the functionality in ProcessEnvironment.remove() to return a bool based on successful removal.
- Refactored `system/system_environment.py` to use platform.system() directly instead of a bespoke function, instead of wrapping the same function. There are plans to create a factory to manage context switching for different platforms, this will handle that behavior automatically.

### Minor Changes

- Updated "user" related comments and names in `process/process_environment.py` to be "process" oriented.
- Removed references to user_environment in `__init__.py`
- Revised a few comments for better wording.

# Version 0.0.6

### Changes

- Refactored `user/user_environment.py` to utilize the os.environ mapping object for greatly simplified methods and better performance.
- Removed `tests/test_process.py`, see previous version.
- Updated project Python version to 3.14

### Minor Changes

- Removed unused subprocess reference from `user/user_environment.py`

# Version 0.0.5

### Changes

- Removed `process/process.py`, it has no mirrors across other implementations, and its inclusion is unnecessary and provides no novel functionality, nor does it make any lower level interface simpler to use.

### Minor Changes

- Added basic styling to python test files

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
