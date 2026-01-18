```
 ____   ___  _  ______  _     _____   __  __  ____ ____  
|  _ \ / _ \| |/ /  _ \| |   / _ \ \ / / |  \/  |/ ___|  _ \ 
| | | | | | | ' /| |_) | |  | | | \ V /  | |\/| | |   | |_) |
| |_| | |_| | . \|  __/| |__| |_| || |   | |  | | |___|  __/ 
|____/ \___/|_|\_\_|   |_____\___/ |_|   |_|  |_|\____|_|    
                                                          
```

# 🚀 DOKPLOY MCP SERVER 🚀

> *The ultimate AI-powered interface to the Dokploy universe*

A next-generation Model Context Protocol (MCP) server that bridges the gap between AI assistants and the powerful Dokploy infrastructure management platform. This middleware translates natural language into API calls, enabling seamless control over your entire cloud infrastructure through conversation.

## ⭐ Why Use This Fork?

**This is an enhanced fork of the [original dokploy-mcp](https://github.com/apple-techie/dokploy-mcp) with significant improvements.**

### 🎯 When to Use This Fork

Use this fork if you need:

- ✅ **Production-Ready MCP Protocol**: Proper stdio-based MCP implementation that actually works with Cursor, Claude Code, and all MCP clients
- ✅ **Reliability Features**: Circuit breaker, automatic retries, and intelligent caching to handle API failures gracefully
- ✅ **Better Performance**: Optimized startup, lazy initialization, and response caching reduce latency
- ✅ **Enhanced Tools**: Docker Compose support, expanded security operations, and unified database management
- ✅ **Better Error Handling**: Clear error messages, parameter validation, and automatic recovery
- ✅ **Active Maintenance**: Regular updates, bug fixes, and compatibility improvements

### 🆚 Key Differences from Original

| Feature | Original | This Fork |
|---------|----------|-----------|
| **MCP Protocol** | Basic implementation | ✅ Full stdio protocol with proper SDK integration |
| **Reliability** | Basic error handling | ✅ Circuit breaker + retry logic + caching |
| **Performance** | Standard | ✅ Optimized with lazy init + caching |
| **Tools** | 13 tools | ✅ 15 tools (added Compose + enhanced security) |
| **Documentation** | Basic | ✅ Comprehensive guides + troubleshooting |
| **Compatibility** | Limited testing | ✅ Verified with Cursor, Claude Code, all MCP clients |
| **Version** | 1.x | ✅ 2.0.0 with breaking improvements |

### 🚨 When NOT to Use This Fork

- You need the exact original implementation
- You're contributing back to the original project (fork this instead)
- You prefer a simpler, minimal implementation

---

## ✨ CAPABILITIES MATRIX ✨

| DOMAIN | CAPABILITIES |
|--------|-------------|
| 🐳 **DOCKER** | Container management, configuration, lifecycle control |
| 🔄 **PROJECTS** | Multi-project workflows, organization, role-based access |
| 🚢 **APPLICATIONS** | Deployment, scaling, monitoring, logs |
| 💾 **DATABASES** | MySQL, PostgreSQL, MongoDB, Redis, MariaDB |
| 🔐 **SECURITY** | SSH keys, certificates, registry credentials |
| 🌐 **NETWORKING** | Domain management, endpoint testing, diagnostics |
| 🤖 **AI** | Model deployment, inference, prompt management |
| 📊 **MONITORING** | Status checks, logs, metrics, diagnostics |
| 🔧 **ADMIN** | User management, server setup, monitoring |

## 🔮 THE FUTURE OF INFRASTRUCTURE MANAGEMENT

```
+-------------------+        +--------------------+        +------------------+
|                   |        |                    |        |                  |
|  AI ASSISTANTS    |------->|  DOKPLOY MCP       |------->|  CLOUD INFRA     |
| (GPT, Claude, etc)|<-------|  (You are here)    |<-------|  (The world)     |
|                   |        |                    |        |                  |
+-------------------+        +--------------------+        +------------------+
```

Seamlessly control your entire infrastructure through natural language. The Dokploy MCP Server acts as a universal translator between AI and your cloud systems.

## 🧠 INTELLIGENT FEATURES

- **API Gateway**: 200+ API endpoints unified under a single intelligent interface
- **Context-Aware Processing**: Understands complex, multi-step infrastructure operations
- **Error Recovery**: Sophisticated error handling with automatic recovery suggestions
- **Security-First Design**: Zero-trust architecture with comprehensive access controls
- **Real-Time Updates**: Streaming updates from long-running operations
- **Circuit Breaker**: Prevents cascading failures during API outages
- **Smart Caching**: Reduces API calls and improves response times
- **Automatic Retries**: Handles transient failures with exponential backoff

## 🔥 QUICKSTART

### Prerequisites

- Node.js v18 or higher
- A Dokploy instance with API access
- MCP-compatible client (Cursor, Claude Code, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/MohamedMohsenX2/dokploy-mcp.git
cd dokploy-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

### Configuration

#### For Cursor IDE

Cursor supports MCP servers via stdio transport. You can configure servers globally or per-project.

**Global Configuration (Recommended)**

Create or edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "dokploy-mcp": {
      "command": "node",
      "args": [
        "/absolute/path/to/dokploy-mcp/dist/mcp-server.js"
      ],
      "env": {
        "DOKPLOY_API_URL": "https://your-dokploy-instance.com/api",
        "DOKPLOY_API_KEY": "your-api-key-here"
      },
      "disabled": false
    }
  }
}
```

**Project-Specific Configuration**

Alternatively, create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "dokploy-mcp": {
      "command": "node",
      "args": [
        "/absolute/path/to/dokploy-mcp/dist/mcp-server.js"
      ],
      "env": {
        "DOKPLOY_API_URL": "https://your-dokploy-instance.com/api",
        "DOKPLOY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Important Notes:**
- Use an absolute path to `dist/mcp-server.js`. Get your path with:
  ```bash
  cd /path/to/dokploy-mcp && pwd
  # Output: /Users/yourname/dokploy-mcp
  # Use: /Users/yourname/dokploy-mcp/dist/mcp-server.js
  ```
- After configuration, completely restart Cursor IDE
- Verify the server appears in Settings → MCP Servers
- Use `@dokploy-mcp` prefix in prompts: `@dokploy-mcp list all projects`
- View MCP logs: View → Output → Select "MCP: dokploy-mcp"

#### For Claude Desktop

Claude Desktop uses a platform-specific configuration file. After editing, you must completely quit and restart Claude Desktop.

**macOS Configuration**

Create or edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dokploy-mcp": {
      "command": "node",
      "args": [
        "/absolute/path/to/dokploy-mcp/dist/mcp-server.js"
      ],
      "env": {
        "DOKPLOY_API_URL": "https://your-dokploy-instance.com/api",
        "DOKPLOY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Windows Configuration**

Create or edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dokploy-mcp": {
      "command": "node",
      "args": [
        "C:\\absolute\\path\\to\\dokploy-mcp\\dist\\mcp-server.js"
      ],
      "env": {
        "DOKPLOY_API_URL": "https://your-dokploy-instance.com/api",
        "DOKPLOY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Linux Configuration**

Create or edit `~/.config/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dokploy-mcp": {
      "command": "node",
      "args": [
        "/absolute/path/to/dokploy-mcp/dist/mcp-server.js"
      ],
      "env": {
        "DOKPLOY_API_URL": "https://your-dokploy-instance.com/api",
        "DOKPLOY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Important Notes:**
- Use absolute paths (especially on Windows with proper escaping)
- Ensure JSON is valid (no trailing commas)
- Completely quit and restart Claude Desktop after configuration
- If tools don't appear, check that the server process starts correctly

#### For Claude Code

Claude Code supports both global and project-level MCP configurations.

**Global Configuration**

Create or edit `~/.claude.json`:

```json
{
  "mcpServers": {
    "dokploy-mcp": {
      "command": "node",
      "args": [
        "/absolute/path/to/dokploy-mcp/dist/mcp-server.js"
      ],
      "env": {
        "DOKPLOY_API_URL": "https://your-dokploy-instance.com/api",
        "DOKPLOY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Project-Level Configuration**

Create `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "dokploy-mcp": {
      "command": "node",
      "args": [
        "/absolute/path/to/dokploy-mcp/dist/mcp-server.js"
      ],
      "env": {
        "DOKPLOY_API_URL": "https://your-dokploy-instance.com/api",
        "DOKPLOY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Important Notes:**
- Project-level servers may require `"enableAllProjectMcpServers": true` in project settings
- The deprecated `~/.claude/settings.json` location is no longer used for MCP configuration
- Restart Claude Code after configuration changes

#### For Google Gemini (Gemini CLI)

Gemini CLI supports MCP servers through its configuration system. This requires Gemini 2.5 Pro or later with MCP capabilities.

**Configuration**

Create or edit the Gemini CLI configuration file (location varies by installation):

```json
{
  "mcpServers": {
    "dokploy-mcp": {
      "command": "node",
      "args": [
        "/absolute/path/to/dokploy-mcp/dist/mcp-server.js"
      ],
      "env": {
        "DOKPLOY_API_URL": "https://your-dokploy-instance.com/api",
        "DOKPLOY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Using with Gemini API**

If you're building a custom integration with Gemini API, you can use the MCP server as a stdio process:

```typescript
import { spawn } from 'child_process'

const mcpProcess = spawn('node', [
  '/absolute/path/to/dokploy-mcp/dist/mcp-server.js'
], {
  env: {
    ...process.env,
    DOKPLOY_API_URL: 'https://your-dokploy-instance.com/api',
    DOKPLOY_API_KEY: 'your-api-key-here'
  }
})

// Connect to MCP server via stdio
// Use Gemini's function calling capabilities to invoke MCP tools
```

**Important Notes:**
- Requires Gemini 2.5 Pro or later for native MCP support
- Ensure you have a valid Gemini API key with MCP-enabled model access
- MCP tools will be available through Gemini's function calling interface
- Large context windows (up to 1M tokens) make complex operations possible

#### For Antigravity IDE

Antigravity is Google's agent-first IDE built on VS Code. It supports MCP servers through its configuration system.

**Configuration**

Create or edit `.vscode/mcp.json` in your project root (Antigravity uses VS Code-compatible configuration):

```json
{
  "servers": {
    "dokploy-mcp": {
      "type": "stdio",
      "command": "node",
      "args": [
        "/absolute/path/to/dokploy-mcp/dist/mcp-server.js"
      ],
      "env": {
        "DOKPLOY_API_URL": "https://your-dokploy-instance.com/api",
        "DOKPLOY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Important Notes:**
- Antigravity is based on VS Code, so it uses similar MCP configuration
- MCP servers are accessible through Antigravity's agent system
- Agents can use MCP tools autonomously for infrastructure management tasks
- Restart Antigravity after configuration changes
- Monitor agent actions carefully, especially for destructive operations

#### For VS Code

VS Code has full MCP specification support as of version 1.102. Configure MCP servers via project-level or workspace settings.

**Project-Level Configuration**

Create `.vscode/mcp.json` in your workspace root:

```json
{
  "servers": {
    "dokploy-mcp": {
      "type": "stdio",
      "command": "node",
      "args": [
        "/absolute/path/to/dokploy-mcp/dist/mcp-server.js"
      ],
      "env": {
        "DOKPLOY_API_URL": "https://your-dokploy-instance.com/api",
        "DOKPLOY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**HTTP Server Configuration (Alternative)**

For remote MCP servers over HTTP:

```json
{
  "servers": {
    "dokploy-mcp": {
      "type": "http",
      "url": "https://your-mcp-server.com/mcp",
      "authentication": {
        "type": "bearer",
        "token": "your-api-key-here"
      }
    }
  }
}
```

**Important Notes:**
- Requires VS Code version 1.102 or later for full MCP support
- Ensure "MCP Servers in Copilot" policy is enabled (for enterprise)
- MCP servers appear in VS Code's Copilot or AI Assistant interface
- Use absolute paths for stdio servers
- Restart VS Code after configuration changes

#### For Windsurf IDE

Windsurf (by Codeium) supports MCP through its Cascade panel. MCP is a paid feature and must be enabled in settings.

**Configuration**

Create or edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "dokploy-mcp": {
      "command": "node",
      "args": [
        "/absolute/path/to/dokploy-mcp/dist/mcp-server.js"
      ],
      "env": {
        "DOKPLOY_API_URL": "https://your-dokploy-instance.com/api",
        "DOKPLOY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**HTTP Server Configuration**

For remote servers:

```json
{
  "mcpServers": {
    "dokploy-mcp": {
      "serverUrl": "https://your-mcp-server.com/mcp",
      "headers": {
        "Authorization": "Bearer your-api-key-here"
      }
    }
  }
}
```

**Important Notes:**
- Enable MCP in Settings → Cascade → Model Context Protocol
- MCP is a paid feature; free tier may not have access
- Total tool count across all MCPs is capped (typically 100 tools)
- You can toggle individual tools on/off per MCP server
- Restart Windsurf or refresh MCPs from UI after configuration changes
- Enterprise accounts can whitelist specific MCP servers

#### For JetBrains IDEs (IntelliJ IDEA, WebStorm, PyCharm, etc.)

JetBrains IDEs support MCP in both client and server modes. Client mode allows connecting to external MCP servers like Dokploy MCP.

**Configuration via Settings UI**

1. Open your JetBrains IDE (IntelliJ IDEA, WebStorm, etc.)
2. Go to **Settings** (or **Preferences** on macOS) → **Tools** → **AI Assistant** → **Model Context Protocol (MCP)**
3. Click **Add** to add a new MCP server
4. Configure the server:
   - **Name**: `dokploy-mcp`
   - **Transport**: `stdio`
   - **Command**: `node`
   - **Arguments**: `/absolute/path/to/dokploy-mcp/dist/mcp-server.js`
   - **Environment Variables**:
     - `DOKPLOY_API_URL`: `https://your-dokploy-instance.com/api`
     - `DOKPLOY_API_KEY`: `your-api-key-here`

**Import from Claude Desktop**

If you already have Claude Desktop configured, you can import the configuration:
1. Go to Settings → Tools → AI Assistant → Model Context Protocol (MCP)
2. Click **Import from Claude Desktop**
3. Select the configuration to import

**Manual JSON Configuration**

Alternatively, you can manually edit the configuration file (location varies by IDE version):

```json
{
  "mcpServers": {
    "dokploy-mcp": {
      "command": "node",
      "args": [
        "/absolute/path/to/dokploy-mcp/dist/mcp-server.js"
      ],
      "env": {
        "DOKPLOY_API_URL": "https://your-dokploy-instance.com/api",
        "DOKPLOY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Important Notes:**
- MCP client support is available in JetBrains IDEs from version 2025.1 onwards
- MCP server mode (exposing IDE tools) requires version 2025.2 or later
- After configuration, verify the server status shows as "Connected" or "Running"
- MCP tools are accessible through the AI Assistant interface
- For Windows, use forward slashes or properly escaped backslashes in paths
- Restart the IDE if the server doesn't appear after configuration

### Testing

Test your setup with the MCP Inspector:

```bash
# Set environment variables
export DOKPLOY_API_URL="https://your-dokploy-instance.com/api"
export DOKPLOY_API_KEY="your-api-key"

# Run inspector
npx @modelcontextprotocol/inspector node dist/mcp-server.js
```

This opens a web interface where you can:
- View all 15 available tools
- Test tool calls interactively
- See request/response data
- Debug integration issues

### Usage Examples

Once configured, ask your MCP client:

**Project Management:**
- "List all my Dokploy projects"
- "Create a new project called 'production'"
- "Show me details of project X"

**Application Management:**
- "@dokploy-mcp deploy application my-app"
- "@dokploy-mcp restart the web-server application"
- "@dokploy-mcp get the last 100 lines of logs for my-app"

**Database Operations:**
- "@dokploy-mcp create a new Postgres database named users-db in project X"
- "@dokploy-mcp start the Redis instance redis-cache"

**Docker Operations:**
- "@dokploy-mcp list all Docker containers"
- "@dokploy-mcp find containers for application my-app"

## 🛸 OPERATION CAPABILITIES

### 🐳 Docker Control Module
- **Container Lifecycle Management**: Start, stop, restart, inspect
- **Configuration Analysis**: Deep inspection of container configurations
- **Intelligent Matching**: Find containers by app name or label patterns
- **Stack Management**: Handle complex multi-container applications

### 🏗️ Project Orchestration
- **Multi-Project Management**: Create, update, duplicate, delete projects
- **Environment Configuration**: Manage environment variables securely
- **Role-Based Access**: Fine-grained permission controls
- **Resource Allocation**: Efficient resource distribution

### 🚀 Application Deployment System
- **Continuous Deployment**: Automated application deployment
- **Scaling Operations**: Scale applications up or down
- **Environment Management**: Control application environments
- **Status Monitoring**: Real-time application health checks
- **GitHub Integration**: Seamless GitHub repository configuration

### 🗄️ Database Command Center
- **Multi-Engine Support**: MySQL, PostgreSQL, MongoDB, Redis, MariaDB
- **Instance Management**: Create, configure, backup, restore
- **Performance Tuning**: Optimize database performance
- **Security Controls**: User management, password policies

### 🔐 Security Operations
- **Certificate Management**: Create, deploy, and rotate TLS certificates
- **SSH Key Control**: Generate and manage SSH keys
- **Registry Credentials**: Secure Docker registry integration
- **User Access Control**: Comprehensive user permission system

### 🌐 Network Intelligence
- **Domain Management**: Register, configure, validate domains
- **Traffic Analysis**: Endpoint testing and diagnostics
- **Load Balancing**: Distribute traffic efficiently
- **SSL/TLS Automation**: Automatic certificate provisioning

### 🤖 AI Operations
- **Model Deployment**: Deploy AI models within your infrastructure
- **Inference Endpoints**: Create and manage prediction APIs
- **Model Management**: Version control for AI models
- **Resource Optimization**: Efficiently allocate GPU/TPU resources

### 🔍 Diagnostics & Monitoring
- **Log Analysis**: Real-time log streaming and analysis
- **Error Diagnosis**: Automatic detection and diagnosis of issues
- **Performance Metrics**: Comprehensive system performance monitoring
- **Health Checks**: Continuous application and service health monitoring

### 🔧 System Administration
- **User Management**: Create, update, delete users and permissions
- **Server Setup**: Automated server provisioning and configuration
- **Backup Systems**: Scheduled backup and restore operations
- **Alert Configuration**: Set up notifications for system events

### 🐙 Docker Compose Support
- **Compose Management**: Create, update, deploy Docker Compose applications
- **Stack Operations**: Start, stop, redeploy entire stacks
- **Multi-Container Apps**: Manage complex multi-service applications

## 🧠 CONSOLIDATED TOOL ARCHITECTURE

The Dokploy MCP uses a powerful consolidated tool architecture that provides comprehensive functionality through a smaller set of high-level tools. This makes it easier for AI assistants to understand and utilize the full capabilities while reducing cognitive load.

### Available Tools (15 Total)

| TOOL | DESCRIPTION | CAPABILITIES |
|------|-------------|--------------|
| `dokploy_project` | Project management | list, get, create, update, delete |
| `dokploy_application` | Application operations | list, get, create, update, delete, deploy, restart, stop, start, redeploy, configure_github |
| `dokploy_server` | Server management | list, get, create, update, delete, setup, validate, security |
| `dokploy_docker` | Docker container operations | list, restart, get_config, find_by_app, find_by_label, find_stack |
| `dokploy_domain` | Domain & certificate management | list, get, create, update, delete, validate, generate |
| `dokploy_monitoring` | Monitoring & logging | app_status, app_logs, server_metrics, setup |
| `dokploy_diagnostics` | Diagnostic utilities | test_endpoint, diagnose_502, check_security |
| `dokploy_deployment` | Deployment operations | deploy, redeploy, rollback |
| `dokploy_database` | Unified database interface | create, get, start, stop, deploy, update, delete, move, reload, rebuild |
| `dokploy_backup` | Backup management | create, get, list, update, delete, manual |
| `dokploy_security` | Security resources | list_ssh_keys, get_ssh_key, create_ssh_key, generate_ssh_key, delete_ssh_key, list_certificates, get_certificate, create_certificate, delete_certificate, list_registries, get_registry, create_registry, delete_registry |
| `dokploy_ai` | AI model management | list, get, create, delete, get_suggestions |
| `dokploy_admin` | User & admin management | list_users, get_user, create_user, delete_user |
| `dokploy_compose` | Docker Compose apps | list, get, create, update, delete, deploy, start, stop, redeploy |
| `dokploy_system` | MCP system management | status, clear_cache, reset_circuit_breaker, metrics |

### How It Works

Each consolidated tool follows a consistent action-based pattern:

```json
{
  "name": "dokploy_application",
  "params": {
    "action": "restart",
    "applicationId": "app-123456"
  }
}
```

The server intelligently maps these high-level actions to the appropriate low-level API calls, handling parameter validation and providing helpful error messages.

### Benefits

- **Simplified Mental Model**: LLMs can more easily understand and remember a small set of powerful tools
- **Consistent Interface**: All tools follow the same action-based pattern
- **Reduced Token Usage**: Fewer tool descriptions means more tokens available for reasoning
- **Better Context Management**: Easier to keep track of related operations within the same tool
- **Enhanced Middleware Capabilities**: The middleware layer can provide advanced features like caching, retries, and circuit breaking

## 🚀 IMPROVEMENTS & ENHANCEMENTS

This fork includes significant improvements and modifications over the original implementation:

### 🔧 Core Architecture Improvements

- **✅ Proper MCP Protocol Implementation**: Complete rewrite with proper stdio transport using `@modelcontextprotocol/sdk`, ensuring full compatibility with Cursor, Claude Code, and all MCP clients
- **✅ Quantum Connector**: Advanced connection management system with:
  - Circuit breaker pattern to prevent cascading failures
  - Intelligent retry logic with exponential backoff
  - Response caching with configurable TTL
  - Request prioritization and deduplication
  - Comprehensive metrics and logging
- **✅ Lazy Initialization**: Optimized server startup with lazy client initialization for faster response times
- **✅ Enhanced Error Handling**: Comprehensive error handling with detailed error messages and recovery suggestions

### 🛠️ New Features & Tools

- **✅ Docker Compose Support**: Full `dokploy_compose` tool for managing Docker Compose applications
- **✅ Enhanced Security Tools**: Expanded security operations including SSH key generation, certificate management, and registry credentials
- **✅ Improved Database Management**: Unified database interface supporting MySQL, PostgreSQL, MongoDB, Redis, and MariaDB with consistent operations
- **✅ GitHub Integration**: Added `configure_github` action for seamless GitHub repository integration
- **✅ System Management**: New `dokploy_system` tool for MCP server health monitoring, cache management, and circuit breaker control

### ⚡ Performance Optimizations

- **✅ Request Caching**: Smart caching system reduces API calls and improves response times
- **✅ Circuit Breaker**: Prevents overwhelming the API during outages
- **✅ Retry Logic**: Automatic retry with exponential backoff for transient failures
- **✅ Optimized Timeouts**: Fine-tuned timeout configurations for better reliability

### 🔒 Reliability & Stability

- **✅ Parameter Validation**: Comprehensive parameter validation with clear error messages
- **✅ Type Safety**: Full TypeScript implementation with proper type definitions
- **✅ Error Recovery**: Automatic recovery from transient failures
- **✅ Status Monitoring**: Built-in health checks and metrics collection

### 🎯 Version Information

- **Version**: Upgraded to `2.0.0` with breaking improvements
- **SDK**: Using latest `@modelcontextprotocol/sdk` v1.25.2
- **Node.js**: Optimized for Node.js v18+

## 🛠️ Directory Structure

```
/src
├── mcp-server.ts         # MCP protocol server (stdio transport)
├── index.ts              # HTTP server (optional, for direct API access)
├── dokploy-client.ts     # The universal translator
├── quantum-connector.ts  # Advanced connection management
└── consolidated-tools.ts # Tool schema definitions
```

## 🆘 Troubleshooting

### Server Not Appearing in Client

1. **Check Path**: Use absolute path to `dist/mcp-server.js` (not relative)
2. **Verify Build**: Ensure `npm run build` completed successfully
3. **Check Permissions**: File should be executable: `chmod +x dist/mcp-server.js`
4. **Environment Variables**: Verify `DOKPLOY_API_URL` and `DOKPLOY_API_KEY` are set in MCP config
5. **Restart Client**: Completely restart your MCP client (Cursor, Claude Code, etc.)

### "Unknown tool" Errors

- The client might be caching tool definitions
- Try: Restart client, clear cache, or use MCP Inspector to verify
- Ensure you're using the latest version of this fork

### Connection/API Errors

1. **Verify API URL**: `DOKPLOY_API_URL` should end with `/api`
2. **Check API Key**: Ensure `DOKPLOY_API_KEY` is valid
3. **Test API Manually**:
   ```bash
   curl -H "x-api-key: YOUR_KEY" \
        https://your-instance.com/api/project.all
   ```
4. **Check Network**: Ensure your Dokploy instance is accessible

### Cursor-Specific Issues

- Use `@dokploy-mcp` prefix in prompts: `@dokploy-mcp list all projects`
- Check Cursor Settings → MCP → Ensure "dokploy-mcp" is enabled
- Try switching AI models (Claude 3.5 Sonnet works best with tools)
- Watch MCP logs: View → Output → Select "MCP: dokploy-mcp"

## 🔐 Security Notes

- **Never commit API keys** to version control
- Use environment variables or secure configuration files
- The MCP server runs with your user permissions
- API calls are made with the provided API key
- Review `.gitignore` to ensure sensitive files are excluded

## 🙏 ACKNOWLEDGMENTS

This project is based on the original work by [Andrew Peltekci](https://github.com/apple-techie/dokploy-mcp) and includes significant improvements and modifications.

**Original Repository:** https://github.com/apple-techie/dokploy-mcp

## 📜 LICENSE

MIT License - See [LICENSE](LICENSE) file for details.

Original work Copyright (c) 2025 Andrew Peltekci  
Modifications and improvements Copyright (c) 2025 Mohamed Mohsen

---

```
    /\__/\    DOKPLOY MCP: Where infrastructure
   /`    '\   becomes conversation and cloud
 === 0  0 ===  management becomes effortless.
   \  --  /    
  /        \   
 /          \  
|            | 
 \  ||  ||  /  
  \_oo__oo_/   
```
