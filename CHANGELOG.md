# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

## [2.0.0] - Previous Release

Initial stable release with full Dokploy API support.
