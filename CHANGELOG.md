# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.2] - 2026-02-01

### Removed
- **Compose update `env` parameter**: Reverted passing `env` in `dokploy_compose` update; compose updates use only `name` and `composeFile` again
- **`dokploy_traefik` tool**: Removed MCP tool and client methods (`readTraefikFile`, `updateTraefikFile`); routing is managed by Dokploy via Domains tab

### Changed
- MCP server and consolidated tools: 15 tools (no `dokploy_traefik`); compose update payload simplified

### Documentation
- **Troubleshooting (README)**: Added “Apps behind Traefik return 404 or appear stuck loading” with **root cause** (Traefik/Docker API version mismatch on server: Traefik’s Docker provider fails, no routes created), **fix** (upgrade Traefik to 3.6.1+ on Dokploy server, or downgrade Docker to 28.x), and **prevention** (ensure Traefik 3.6.1+ on new servers or after Docker upgrades). Ensures the loading-stuck issue is documented and avoidable.

## [2.0.1] - 2026-01-19

### Fixed
- **Performance**: Fixed extreme startup delay (143s → 29ms) caused by corrupted node_modules
  - Resolved axios import taking 2+ minutes
  - Resolved node-cache import taking 7+ seconds
  - Fixed node-cache TypeScript import issue (changed to `import NodeCache = require('node-cache')`)
- **MCP SDK**: Fixed missing `protocol.js` module error by reinstalling corrupted `@modelcontextprotocol/sdk` package
- **Error Messages**: Added `save_build_type` to supported actions list in error message (line 268)
- **Code Quality**: Removed unused `resourceType` variable from `dokploy_security` tool handler

### Added
- **Graceful Shutdown**: Implemented comprehensive shutdown handling
  - Added `cleanup()` method to `QuantumConnector` to clear intervals and event listeners
  - Added `cleanup()` method to `DokployClient` for resource cleanup
  - Added signal handlers for SIGTERM, SIGINT, uncaughtException, and unhandledRejection
  - Prevents resource leaks and ensures clean shutdown in production environments

### Changed
- Improved error handling and resource management
- Enhanced production readiness with proper cleanup mechanisms

## [2.0.0] - 2026-01-18

### Added
- **MCP Protocol**: Complete stdio-based MCP protocol implementation using `@modelcontextprotocol/sdk`
  - Full compatibility with Cursor, Claude Code, and all MCP clients
  - Proper tool registration and request handling
  - Standard MCP protocol compliance
- **Quantum Connector**: Advanced connection management system
  - Circuit breaker pattern to prevent cascading failures
  - Intelligent retry logic with exponential backoff
  - Response caching with configurable TTL
  - Request prioritization and deduplication
  - Comprehensive metrics and logging
- **15 Consolidated Tools**: Unified tool interface for Dokploy API
  - `dokploy_project` - Project management (list, get, create, update, delete)
  - `dokploy_application` - Application lifecycle management (deploy, restart, stop, start, etc.)
  - `dokploy_server` - Server management and setup
  - `dokploy_docker` - Docker container operations
  - `dokploy_domain` - Domain and certificate management
  - `dokploy_monitoring` - Application monitoring and logs
  - `dokploy_diagnostics` - Diagnostic tools for troubleshooting
  - `dokploy_deployment` - Deployment and CI/CD operations
  - `dokploy_database` - Database management (MySQL, PostgreSQL, MongoDB, Redis, MariaDB)
  - `dokploy_backup` - Backup management
  - `dokploy_security` - SSH keys, certificates, registry credentials
  - `dokploy_ai` - AI model deployment and inference
  - `dokploy_admin` - User and system management
  - `dokploy_compose` - Docker Compose applications
  - `dokploy_system` - MCP server health and management
- **Enhanced Error Handling**: Comprehensive error handling with detailed messages and recovery suggestions
- **Parameter Validation**: Full parameter validation with clear error messages for all tools
- **Type Safety**: Complete TypeScript implementation with proper type definitions

### Changed
- **Architecture**: Complete rewrite with proper MCP protocol implementation
- **Initialization**: Optimized server startup with lazy client initialization
- **Input Types**: Flexible tool schemas accepting string, number, boolean, array, and object types
- **Action-Based Tools**: All consolidated tools use action-based operation semantics

### Performance
- Lazy initialization for faster startup
- Request caching to reduce API calls
- Optimized timeout configurations
- Efficient resource management

### Documentation
- Comprehensive README with installation and usage instructions
- API cheatsheet for reference
- Troubleshooting guide for common issues
