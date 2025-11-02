# Environment

Environment is a polyglot monorepository that provides a unified, type-safe, and consistent API across multiple programming languages to interact with the system, user, and process environment, regardless of platform.

The goal is to offer developers a familiar, reliable, and cross-language API design that behaves consistently in **Node.js**, **Python**, **Go**, **Rust**, **C#**, and **PowerShell** ecosystems.

---

## Vision

- **Unified Developer Experience:** Common API design across all supported languages.  
- **Type-Safe:** Strong typing and validation to ensure stability.  
- **Cross-Language Parity:** Every feature behaves the same way, no matter the language.  
- **Open & Extensible:** Easy to contribute new language bindings or platform abstractions.  

---

## Repository Structure

```

/packages/
├── node/          → TypeScript / Node.js implementation
├── python/        → Python implementation
├── rust/          → Rust crate
├── go/            → Go module
├── csharp/        → .NET / C# library
└── powershell/    → PowerShell module

```

Each language implementation exposes a similar structure and API namespace:

```

/node/
├─ system      → OS-level information and configuration
├─ user        → User-specific data and environment variables
└─ process     → Process metadata, PID management, and runtime helpers

````

---

## Current Status

Environment is **under active development** as part of a monorepository transformation.

We are currently:
- Standardizing interfaces and APIs across all supported languages.  
- Designing automated tests to ensure cross-language parity.  
- Setting up unified build tooling and CI workflows.  

If you’d like to help, whether through code, design, or feedback; contributions are highly welcome.

> See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and contribution guidelines.

---

## Documentation

A complete documentation site with:
- Tutorials  
- Examples  
- API reference  
- Contribution guides  

[**tools.octovel.com/environment**](https://tools.octovel.com/environment)

---

## Supported Languages (Planned)

| Language | Status | Package Manager |
|-----------|:-------:|----------------|
| Node.js (TypeScript) | Active | pnpm |
| Python | In Progress | uv |
| Rust | In Progress | Cargo |
| Go | In Progress | go mod |
| C# (.NET) | In Progress | dotnet CLI |
| PowerShell | In Progress | pwsh module |

---

## Tooling and Build

The project uses a **Makefile** to streamline builds, and testing across languages:

```bash
# Build all implementations
make build

# Run tests
make test
````

Each implementation can also be built independently using its native tools (e.g., `pnpm build`, `cargo build`, `poetry build`).

---

## Contributing

We love and appreciate community contributions!
You can contribute by:

* Implementing a new language binding
* Improving API consistency
* Fixing bugs or adding test coverage
* Enhancing documentation

Before opening a pull request, please review:

* [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
* [CONTRIBUTING.md](CONTRIBUTING.md)
* [ARCHITECTURE.md](ARCHITECTURE.md)

---

## Philosophy

Environment is designed around these core principles:

1. **Predictable Behavior:**
   All implementations must follow the same API contracts and error handling patterns.

2. **Language-First Design:**
   Each implementation should feel natural within its ecosystem, using idiomatic language features.

3. **Open Collaboration:**
   The specification and interfaces are public and versioned, allowing community-built adapters.

---

## Versioning

Each language maintains its **own semantic version** (e.g., in `package.json`, `pyproject.toml`, etc.),
while the root-level [`VERSION`](./VERSION) file defines the **monorepo meta-version** used for coordinated releases.

---

## License

Licensed under the **Apache License 2.0**
© [Octovel](https://github.com/octovel)

You’re free to use, modify, and distribute this project under the terms of the license.

---

## Acknowledgements

This project is maintained by the [Octovel](https://github.com/octovel) team and the open-source community.
Special thanks to all contributors and maintainers across the supported ecosystems.
