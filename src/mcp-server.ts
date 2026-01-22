#!/usr/bin/env node

/**
 * Dokploy MCP Server - Proper MCP Protocol Implementation
 * 
 * This server implements the Model Context Protocol (MCP) using stdio
 * to communicate with Cursor IDE and other MCP clients.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import type { CallToolRequest } from '@modelcontextprotocol/sdk/types.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js'
import { DokployClient } from './dokploy-client'
import { toolSchemas } from './consolidated-tools'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const DOKPLOY_API_URL = process.env.DOKPLOY_API_URL || 'http://localhost:3000/api'
const DOKPLOY_API_KEY = process.env.DOKPLOY_API_KEY || ''

// Lazy initialization to speed up server startup
let dokployClient: DokployClient | null = null

function getDokployClient(): DokployClient {
  if (!dokployClient) {
    dokployClient = new DokployClient(DOKPLOY_API_URL, DOKPLOY_API_KEY, {
      circuitBreaker: {
        failureThreshold: 3,
        resetTimeout: 10000,
        requestTimeout: 8000
      },
      retry: {
        maxRetries: 1,
        initialDelayMs: 100,
        maxDelayMs: 1000,
        backoffFactor: 2,
        retryableStatusCodes: [408, 429, 500, 502, 503, 504]
      },
      cache: {
        enabled: true,
        ttlSeconds: 300,
        maxSize: 1000,
        excludedEndpoints: ['/application.logs', '/docker.getContainers']
      }
    })
  }
  return dokployClient
}

// Create MCP server
const server = new Server(
  {
    name: 'dokploy-mcp',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {
        listChanged: true,
      },
    },
  }
)

// Pre-compute MCP tools at module load time to avoid delays
const mcpTools: Tool[] = Object.entries(toolSchemas).map(([name, schema]) => ({
  name,
  description: schema.description,
  inputSchema: {
    type: 'object',
    properties: Object.entries(schema.parameters).reduce((acc, [key, desc]) => {
      acc[key] = {
        type: ['string', 'number', 'boolean', 'array', 'object'],
        description: desc as string,
      }
      return acc
    }, {} as Record<string, any>),
    required: ['action'], // All tools require action parameter
  },
}))

// Return pre-computed tools instantly
function getMCPTools(): Tool[] {
  return mcpTools
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: getMCPTools(),
}))

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params

  try {
    let result: any

    // Handle dokploy_project tool
    if (name === 'dokploy_project') {
      const action = args?.action as string
      
      switch (action) {
        case 'list':
          result = await getDokployClient().getAllProjects()
          break
        case 'get':
          if (!args?.projectId) {
            throw new Error('projectId is required for get action')
          }
          result = await getDokployClient().getProject(args.projectId as string)
          break
        case 'create':
          if (!args?.name) {
            throw new Error('name is required for create action')
          }
          result = await getDokployClient().createProject(
            args.name as string,
            args?.description as string | undefined,
            args?.env as string | undefined
          )
          break
        case 'update':
          if (!args?.projectId) {
            throw new Error('projectId is required for update action')
          }
          result = await getDokployClient().updateProject(
            args.projectId as string,
            args?.name as string | undefined,
            args?.description as string | undefined,
            args?.env as string | undefined
          )
          break
        case 'delete':
          if (!args?.projectId) {
            throw new Error('projectId is required for delete action')
          }
          result = await getDokployClient().deleteProject(args.projectId as string)
          break
        default:
          throw new Error(`Unknown action: ${action}. Supported actions: list, get, create, update, delete`)
      }
    }
    // Handle dokploy_application tool
    else if (name === 'dokploy_application') {
      const action = args?.action as string
      
      switch (action) {
        case 'list':
          if (!args?.projectId) {
            throw new Error('projectId is required for list action')
          }
          result = await getDokployClient().getApplications(args.projectId as string)
          break
        case 'get':
          if (!args?.applicationId) {
            throw new Error('applicationId is required for get action')
          }
          result = await getDokployClient().getApplication(args.applicationId as string)
          break
        case 'create':
          if (!args?.name || !args?.appName || !args?.projectId || !args?.environmentId) {
            throw new Error('name, appName, projectId, and environmentId are required for create action')
          }
          result = await getDokployClient().createApplication(
            args.name as string,
            args.appName as string,
            args?.description as string || '',
            args.projectId as string,
            args.environmentId as string,
            args?.serverId as string | undefined
          )
          break
        case 'update':
          if (!args?.applicationId) {
            throw new Error('applicationId is required for update action')
          }
          const updateData: Record<string, any> = {}
          if (args?.name) updateData.name = args.name
          if (args?.appName) updateData.appName = args.appName
          if (args?.description) updateData.description = args.description
          if (args?.env) updateData.env = args.env
          if (args?.branch) updateData.branch = args.branch
          if (args?.repository) updateData.repository = args.repository
          if (args?.owner) updateData.owner = args.owner
          if (args?.sourceType) updateData.sourceType = args.sourceType
          if (args?.autoDeploy !== undefined) updateData.autoDeploy = args.autoDeploy
          if (args?.triggerType) updateData.triggerType = args.triggerType
          if (args?.buildType) updateData.buildType = args.buildType
          if (args?.dockerfile) updateData.dockerfile = args.dockerfile
          if (args?.dockerContextPath) updateData.dockerContextPath = args.dockerContextPath
          if (args?.dockerBuildStage) updateData.dockerBuildStage = args.dockerBuildStage
          result = await getDokployClient().updateApplication(
            args.applicationId as string,
            updateData
          )
          break
        case 'configure_github':
          if (!args?.applicationId || !args?.repository || !args?.branch || !args?.owner || !args?.githubId) {
            throw new Error('applicationId, repository, branch, owner, and githubId are required for configure_github action')
          }
          result = await getDokployClient().saveGithubProvider(
            args.applicationId as string,
            {
              repository: args.repository as string,
              branch: args.branch as string,
              owner: args.owner as string,
              githubId: args.githubId as string,
              buildPath: args?.buildPath as string || '/',
              watchPaths: args?.watchPaths as string[] || [],
              enableSubmodules: args?.enableSubmodules as boolean || false,
              triggerType: (args?.triggerType as 'push' | 'tag') || 'push'
            }
          )
          break
        case 'save_build_type':
          if (!args?.applicationId || !args?.buildType) {
            throw new Error('applicationId and buildType are required for save_build_type action')
          }
          result = await getDokployClient().saveBuildType(
            args.applicationId as string,
            args.buildType as string,
            args?.dockerfile as string | undefined,
            args?.dockerContextPath as string || '',
            args?.dockerBuildStage as string || '',
            args?.herokuVersion as string | undefined,
            args?.publishDirectory as string | undefined
          )
          break
        case 'delete':
          if (!args?.applicationId) {
            throw new Error('applicationId is required for delete action')
          }
          result = await getDokployClient().deleteApplication(args.applicationId as string)
          break
        case 'deploy':
          if (!args?.applicationId) {
            throw new Error('applicationId is required for deploy action')
          }
          result = await getDokployClient().deployApplication(args.applicationId as string)
          break
        case 'restart':
        case 'redeploy':
          if (!args?.applicationId) {
            throw new Error('applicationId is required for restart/redeploy action')
          }
          result = await getDokployClient().redeployApplication(args.applicationId as string)
          break
        case 'stop':
          if (!args?.applicationId) {
            throw new Error('applicationId is required for stop action')
          }
          result = await getDokployClient().stopApplication(args.applicationId as string)
          break
        case 'start':
          if (!args?.applicationId) {
            throw new Error('applicationId is required for start action')
          }
          result = await getDokployClient().startApplication(args.applicationId as string)
          break
        default:
          throw new Error(`Unknown action: ${action}. Supported actions: list, get, create, update, delete, deploy, restart, stop, start, redeploy, configure_github, save_build_type`)
      }
    }
    // Handle dokploy_domain tool
    else if (name === 'dokploy_domain') {
      const action = args?.action as string
      
      switch (action) {
        case 'create':
          if (!args?.applicationId || !args?.domain) {
            throw new Error('applicationId and domain are required for create action')
          }
          result = await getDokployClient().createDomain(
            args.applicationId as string,
            args.domain as string,
            {
              ...(args?.certId ? { certId: args.certId as string } : {}),
              ...(args?.https !== undefined ? { https: args.https } : {}),
              ...(args?.port ? { port: args.port } : {}),
              ...(args?.certificateType ? { certificateType: args.certificateType } : {})
            }
          )
          break
        case 'update':
          if (!args?.domainId) {
            throw new Error('domainId is required for update action')
          }
          const domainUpdateData: Record<string, any> = {}
          if (args?.host) domainUpdateData.host = args.host
          if (args?.https !== undefined) domainUpdateData.https = args.https
          if (args?.port) domainUpdateData.port = args.port
          if (args?.certificateType) domainUpdateData.certificateType = args.certificateType
          result = await getDokployClient().updateDomain(
            args.domainId as string,
            domainUpdateData
          )
          break
        case 'get':
          if (!args?.domainId) {
            throw new Error('domainId is required for get action')
          }
          result = await getDokployClient().getDomain(args.domainId as string)
          break
        case 'list':
          if (!args?.applicationId) {
            throw new Error('applicationId is required for list action')
          }
          result = await getDokployClient().getDomainsByApplicationId(args.applicationId as string)
          break
        case 'validate':
          if (!args?.domain) {
            throw new Error('domain is required for validate action')
          }
          result = await getDokployClient().validateDomain(args.domain as string)
          break
        case 'delete':
          if (!args?.domainId) {
            throw new Error('domainId is required for delete action')
          }
          result = await getDokployClient().deleteDomain(args.domainId as string)
          break
        case 'generate':
          if (!args?.applicationId) {
            throw new Error('applicationId is required for generate action')
          }
          result = await getDokployClient().generateDomain(
            args.applicationId as string,
            {}
          )
          break
        default:
          throw new Error(`Unknown action: ${action}. Supported actions: list, get, create, update, delete, validate, generate`)
      }
    }
    // Handle dokploy_server tool
    else if (name === 'dokploy_server') {
      const action = args?.action as string
      
      switch (action) {
        case 'list':
          result = await getDokployClient().getAllServers()
          break
        case 'get':
          if (!args?.serverId) {
            throw new Error('serverId is required for get action')
          }
          result = await getDokployClient().getServer(args.serverId as string)
          break
        case 'create':
          if (!args?.name || !args?.ip || !args?.sshKeyId) {
            throw new Error('name, ip, and sshKeyId are required for create action')
          }
          result = await getDokployClient().createServer(
            args.name as string,
            args.ip as string,
            args.sshKeyId as string,
            {
              ...(args?.adminUsername ? { adminUsername: args.adminUsername as string } : {})
            }
          )
          break
        case 'update':
          if (!args?.serverId) {
            throw new Error('serverId is required for update action')
          }
          const serverUpdateData: Record<string, any> = {}
          if (args?.name) serverUpdateData.name = args.name
          if (args?.ip) serverUpdateData.ip = args.ip
          result = await getDokployClient().updateServer(
            args.serverId as string,
            serverUpdateData
          )
          break
        case 'delete':
          if (!args?.serverId) {
            throw new Error('serverId is required for delete action')
          }
          result = await getDokployClient().removeServer(args.serverId as string)
          break
        case 'setup':
          if (!args?.serverId) {
            throw new Error('serverId is required for setup action')
          }
          result = await getDokployClient().setupServer(args.serverId as string)
          break
        case 'validate':
          if (!args?.serverId) {
            throw new Error('serverId is required for validate action')
          }
          result = await getDokployClient().validateServer(args.serverId as string)
          break
        case 'security':
          if (!args?.serverId) {
            throw new Error('serverId is required for security action')
          }
          result = await getDokployClient().checkServerSecurity(args.serverId as string)
          break
        default:
          throw new Error(`Unknown action: ${action}. Supported actions: list, get, create, update, delete, setup, validate, security`)
      }
    }
    // Handle dokploy_docker tool
    else if (name === 'dokploy_docker') {
      const action = args?.action as string
      
      switch (action) {
        case 'list':
          result = await getDokployClient().getDockerContainers(args?.serverId as string | undefined)
          break
        case 'restart':
          if (!args?.containerId) {
            throw new Error('containerId is required for restart action')
          }
          result = await getDokployClient().restartDockerContainer(args.containerId as string)
          break
        case 'get_config':
          if (!args?.containerId) {
            throw new Error('containerId is required for get_config action')
          }
          result = await getDokployClient().getDockerConfig(
            args.containerId as string,
            args?.serverId as string | undefined
          )
          break
        case 'find_by_app':
          if (!args?.appName) {
            throw new Error('appName is required for find_by_app action')
          }
          const appName = args.appName as string
          const appType = args?.appType as string | undefined
          const serverId = args?.serverId as string | undefined
          
          // If appType is "application", automatically use find_by_label with type="standalone"
          // since find_by_app only accepts "stack" or "docker-compose" per API spec
          if (appType && appType.toLowerCase() === 'application') {
            try {
              result = await getDokployClient().getDockerContainersByAppLabel(
                appName,
                'standalone',
                serverId
              )
              break
            } catch (error: any) {
              throw new Error(
                `Failed to find containers for application "${appName}" using find_by_label. ` +
                `Error: ${error.message}. ` +
                `Note: For application containers, use find_by_label with type="standalone" or "swarm".`
              )
            }
          }

          // For valid appType values ("stack" or "docker-compose"), use find_by_app
          try {
            result = await getDokployClient().getDockerContainersByAppNameMatch(
              appName,
              appType,
              serverId
            )
          } catch (error: any) {
            // If find_by_app fails, try fallback methods
            // Try find_by_label with "standalone" as fallback
            try {
              result = await getDokployClient().getDockerContainersByAppLabel(
                appName,
                'standalone',
                serverId
              )
              break
            } catch (labelError: any) {
              // Continue to next fallback
            }

            // Try find_stack as last resort
            try {
              result = await getDokployClient().getStackContainersByAppName(
                appName,
                serverId
              )
              break
            } catch (stackError: any) {
              // All fallbacks failed
            }

            // If all methods fail, throw the original error with context
            throw new Error(
              `Failed to find containers for app "${appName}". ` +
              `Original error: ${error.message}. ` +
              `Tried fallback methods: find_by_label (standalone), find_stack. ` +
              `All methods failed. Please verify the app name exists and is accessible.`
            )
          }
          break
        case 'find_by_label':
          if (!args?.appName || !args?.type) {
            throw new Error('appName and type are required for find_by_label action')
          }
          result = await getDokployClient().getDockerContainersByAppLabel(
            args.appName as string,
            args.type as string,
            args?.serverId as string | undefined
          )
          break
        case 'find_stack':
          if (!args?.appName) {
            throw new Error('appName is required for find_stack action')
          }
          result = await getDokployClient().getStackContainersByAppName(
            args.appName as string,
            args?.serverId as string | undefined
          )
          break
        default:
          throw new Error(`Unknown action: ${action}. Supported actions: list, restart, get_config, find_by_app, find_by_label, find_stack`)
      }
    }
    // Handle dokploy_monitoring tool
    else if (name === 'dokploy_monitoring') {
      const action = args?.action as string
      
      switch (action) {
        case 'app_status':
          if (!args?.applicationId) {
            throw new Error('applicationId is required for app_status action')
          }
          result = await getDokployClient().getApplicationStatus(args.applicationId as string)
          break
        case 'app_logs':
          if (!args?.applicationId) {
            throw new Error('applicationId is required for app_logs action')
          }
          const logOptions: Record<string, any> = {}
          if (args?.lines) logOptions.lines = args.lines
          result = await getDokployClient().getApplicationLogs(
            args.applicationId as string,
            logOptions
          )
          break
        case 'server_metrics':
          if (!args?.serverId) {
            throw new Error('serverId is required for server_metrics action')
          }
          result = await getDokployClient().getServerMetrics(args.serverId as string)
          break
        case 'setup':
          const metricsConfig = args?.metricsConfig as Record<string, any> || {}
          result = await getDokployClient().setupMonitoring(metricsConfig)
          break
        default:
          throw new Error(`Unknown action: ${action}. Supported actions: app_status, app_logs, server_metrics, setup`)
      }
    }
    // Handle dokploy_diagnostics tool
    else if (name === 'dokploy_diagnostics') {
      const action = args?.action as string
      
      switch (action) {
        case 'test_endpoint':
          if (!args?.url) {
            throw new Error('url is required for test_endpoint action')
          }
          result = await getDokployClient().testEndpoint(args.url as string)
          break
        case 'diagnose_502':
          if (!args?.domain) {
            throw new Error('domain is required for diagnose_502 action')
          }
          // Test the domain endpoint
          const testUrl = `https://${args.domain as string}`
          result = await getDokployClient().testEndpoint(testUrl)
          break
        case 'check_security':
          if (!args?.serverId) {
            throw new Error('serverId is required for check_security action')
          }
          result = await getDokployClient().checkServerSecurity(args.serverId as string)
          break
        default:
          throw new Error(`Unknown action: ${action}. Supported actions: test_endpoint, diagnose_502, check_security`)
      }
    }
    // Handle dokploy_deployment tool
    else if (name === 'dokploy_deployment') {
      const action = args?.action as string
      
      switch (action) {
        case 'deploy':
          if (!args?.resourceType || !args?.resourceId) {
            throw new Error('resourceType and resourceId are required for deploy action')
          }
          const resourceType = args.resourceType as string
          const resourceId = args.resourceId as string
          
          if (resourceType === 'application') {
            result = await getDokployClient().deployApplication(resourceId)
          } else if (resourceType === 'database') {
            // Need database type to determine which deploy method to use
            throw new Error('For database deployment, use dokploy_database tool with deploy action')
          } else {
            throw new Error(`Unsupported resource type: ${resourceType}`)
          }
          break
        case 'redeploy':
          if (!args?.resourceType || !args?.resourceId) {
            throw new Error('resourceType and resourceId are required for redeploy action')
          }
          const redeployResourceType = args.resourceType as string
          const redeployResourceId = args.resourceId as string
          
          if (redeployResourceType === 'application') {
            result = await getDokployClient().redeployApplication(redeployResourceId)
          } else {
            throw new Error(`Unsupported resource type for redeploy: ${redeployResourceType}`)
          }
          break
        case 'rollback':
          if (!args?.resourceType || !args?.resourceId) {
            throw new Error('resourceType and resourceId are required for rollback action')
          }
          // Rollback typically requires version, but API may vary
          throw new Error('Rollback functionality needs to be implemented based on specific API endpoint')
        default:
          throw new Error(`Unknown action: ${action}. Supported actions: deploy, redeploy, rollback`)
      }
    }
    // Handle dokploy_database tool
    else if (name === 'dokploy_database') {
      const action = args?.action as string
      const dbType = (args?.type as string)?.toLowerCase()
      
      if (!dbType) {
        throw new Error('type is required (mysql, postgres, mongo, redis, mariadb)')
      }
      
      switch (action) {
        case 'create':
          if (!args?.projectId || !args?.name) {
            throw new Error('projectId and name are required for create action')
          }
          if (dbType === 'postgres') {
            result = await getDokployClient().createPostgres(
              args.projectId as string,
              args.name as string,
              args?.password as string || 'password'
            )
          } else if (dbType === 'redis') {
            result = await getDokployClient().createRedis(
              args.projectId as string,
              args.name as string
            )
          } else if (dbType === 'mongo') {
            result = await getDokployClient().createMongo(
              args.projectId as string,
              args.name as string,
              args?.password as string || 'password'
            )
          } else if (dbType === 'mariadb') {
            result = await getDokployClient().createMariadb(
              args.projectId as string,
              args.name as string,
              args?.password as string | undefined,
              {}
            )
          } else {
            throw new Error(`Database type ${dbType} create not yet implemented. Supported: postgres, redis, mongo, mariadb`)
          }
          break
        case 'get':
          if (!args?.databaseId) {
            throw new Error('databaseId is required for get action')
          }
          if (dbType === 'mysql') {
            result = await getDokployClient().getMysql(args.databaseId as string)
          } else if (dbType === 'postgres') {
            result = await getDokployClient().getPostgres(args.databaseId as string)
          } else if (dbType === 'redis') {
            result = await getDokployClient().getRedis(args.databaseId as string)
          } else if (dbType === 'mongo') {
            result = await getDokployClient().getMongo(args.databaseId as string)
          } else if (dbType === 'mariadb') {
            result = await getDokployClient().getMariadb(args.databaseId as string)
          } else {
            throw new Error(`Unsupported database type: ${dbType}`)
          }
          break
        case 'start':
          if (!args?.databaseId) {
            throw new Error('databaseId is required for start action')
          }
          if (dbType === 'mysql') {
            result = await getDokployClient().startMysql(args.databaseId as string)
          } else if (dbType === 'postgres') {
            result = await getDokployClient().startPostgres(args.databaseId as string)
          } else if (dbType === 'redis') {
            result = await getDokployClient().startRedis(args.databaseId as string)
          } else {
            throw new Error(`Start action for ${dbType} not yet implemented`)
          }
          break
        case 'stop':
          if (!args?.databaseId) {
            throw new Error('databaseId is required for stop action')
          }
          if (dbType === 'mysql') {
            result = await getDokployClient().stopMysql(args.databaseId as string)
          } else if (dbType === 'postgres') {
            result = await getDokployClient().stopPostgres(args.databaseId as string)
          } else if (dbType === 'redis') {
            result = await getDokployClient().stopRedis(args.databaseId as string)
          } else {
            throw new Error(`Stop action for ${dbType} not yet implemented`)
          }
          break
        case 'deploy':
          if (!args?.databaseId) {
            throw new Error('databaseId is required for deploy action')
          }
          if (dbType === 'mysql') {
            result = await getDokployClient().deployMysql(args.databaseId as string)
          } else if (dbType === 'postgres') {
            result = await getDokployClient().deployPostgres(args.databaseId as string)
          } else if (dbType === 'redis') {
            result = await getDokployClient().deployRedis(args.databaseId as string)
          } else {
            throw new Error(`Deploy action for ${dbType} not yet implemented`)
          }
          break
        case 'update':
          if (!args?.databaseId) {
            throw new Error('databaseId is required for update action')
          }
          const dbUpdateData: Record<string, any> = {}
          if (args?.name) dbUpdateData.name = args.name
          if (args?.password) dbUpdateData.password = args.password
          if (args?.externalPort) dbUpdateData.externalPort = args.externalPort
          
          if (dbType === 'mysql') {
            result = await getDokployClient().updateMysql(args.databaseId as string, dbUpdateData)
          } else if (dbType === 'postgres') {
            result = await getDokployClient().updatePostgres(args.databaseId as string, dbUpdateData)
          } else if (dbType === 'redis') {
            result = await getDokployClient().updateRedis(args.databaseId as string, dbUpdateData)
          } else {
            throw new Error(`Update action for ${dbType} not yet implemented`)
          }
          break
        case 'delete':
          if (!args?.databaseId) {
            throw new Error('databaseId is required for delete action')
          }
          if (dbType === 'mysql') {
            result = await getDokployClient().removeMysql(args.databaseId as string)
          } else if (dbType === 'postgres') {
            result = await getDokployClient().removePostgres(args.databaseId as string)
          } else if (dbType === 'redis') {
            result = await getDokployClient().removeRedis(args.databaseId as string)
          } else {
            throw new Error(`Delete action for ${dbType} not yet implemented`)
          }
          break
        case 'reload':
          if (!args?.databaseId) {
            throw new Error('databaseId is required for reload action')
          }
          if (dbType === 'mysql') {
            result = await getDokployClient().reloadMysql(args.databaseId as string)
          } else {
            throw new Error(`Reload action for ${dbType} not yet implemented`)
          }
          break
        default:
          throw new Error(`Unknown action: ${action}. Supported actions: create, get, start, stop, deploy, update, delete, move, reload, rebuild`)
      }
    }
    // Handle dokploy_backup tool
    else if (name === 'dokploy_backup') {
      const action = args?.action as string
      
      switch (action) {
        case 'create':
          if (!args?.projectId || !args?.name) {
            throw new Error('projectId and name are required for create action')
          }
          result = await getDokployClient().createBackup(
            args.projectId as string,
            args.name as string,
            args?.databaseId ? { databaseId: args.databaseId as string } : {}
          )
          break
        case 'get':
          if (!args?.backupId) {
            throw new Error('backupId is required for get action')
          }
          result = await getDokployClient().getBackup(args.backupId as string)
          break
        case 'list':
          if (!args?.backupId) {
            throw new Error('backupId is required for list action (to list backup files)')
          }
          result = await getDokployClient().listBackupFiles(args.backupId as string)
          break
        case 'update':
          if (!args?.backupId) {
            throw new Error('backupId is required for update action')
          }
          const backupUpdateData: Record<string, any> = {}
          if (args?.name) backupUpdateData.name = args.name
          result = await getDokployClient().updateBackup(
            args.backupId as string,
            backupUpdateData
          )
          break
        case 'delete':
          if (!args?.backupId) {
            throw new Error('backupId is required for delete action')
          }
          result = await getDokployClient().removeBackup(args.backupId as string)
          break
        case 'manual':
          if (!args?.databaseId || !args?.databaseType) {
            throw new Error('databaseId and databaseType are required for manual action')
          }
          const dbType = (args.databaseType as string).toLowerCase()
          if (dbType === 'postgres') {
            result = await getDokployClient().manualBackupPostgres(args.databaseId as string)
          } else if (dbType === 'mysql') {
            result = await getDokployClient().manualBackupMySql(args.databaseId as string)
          } else {
            throw new Error(`Manual backup for ${dbType} not yet implemented`)
          }
          break
        default:
          throw new Error(`Unknown action: ${action}. Supported actions: create, get, list, update, delete, manual`)
      }
    }
    // Handle dokploy_system tool
    else if (name === 'dokploy_system') {
      const action = args?.action as string
      
      switch (action) {
        case 'status':
          result = getDokployClient().getQuantumStatus()
          break
        case 'clear_cache':
          getDokployClient().clearQuantumCache()
          result = { success: true, message: 'Cache cleared successfully' }
          break
        case 'reset_circuit_breaker':
          getDokployClient().resetQuantumCircuitBreaker()
          result = { success: true, message: 'Circuit breaker reset successfully' }
          break
        case 'metrics':
          result = getDokployClient().getQuantumMetrics()
          break
        default:
          throw new Error(`Unknown action: ${action}. Supported actions: status, clear_cache, reset_circuit_breaker, metrics`)
      }
    }
    // Handle dokploy_security tool
    else if (name === 'dokploy_security') {
      const action = args?.action as string
      
      switch (action) {
        case 'list_ssh_keys':
          result = await getDokployClient().getAllSshKeys()
          break
        case 'get_ssh_key':
          if (!args?.resourceId) {
            throw new Error('resourceId is required for get_ssh_key action')
          }
          result = await getDokployClient().getSshKey(args.resourceId as string)
          break
        case 'create_ssh_key':
          if (!args?.name || !args?.publicKey) {
            throw new Error('name and publicKey are required for create_ssh_key action')
          }
          result = await getDokployClient().createSshKey(
            args.name as string,
            args.publicKey as string,
            args?.privateKey as string | undefined
          )
          break
        case 'generate_ssh_key':
          if (!args?.name) {
            throw new Error('name is required for generate_ssh_key action')
          }
          result = await getDokployClient().generateSshKey(args.name as string)
          break
        case 'delete_ssh_key':
          if (!args?.resourceId) {
            throw new Error('resourceId is required for delete_ssh_key action')
          }
          result = await getDokployClient().removeSshKey(args.resourceId as string)
          break
        case 'list_certificates':
          result = await getDokployClient().getAllCertificates()
          break
        case 'get_certificate':
          if (!args?.resourceId) {
            throw new Error('resourceId is required for get_certificate action')
          }
          result = await getDokployClient().getCertificate(args.resourceId as string)
          break
        case 'create_certificate':
          if (!args?.name || !args?.certificate || !args?.certificateKey) {
            throw new Error('name, certificate, and certificateKey are required for create_certificate action')
          }
          result = await getDokployClient().createCertificate(
            args.name as string,
            args.certificate as string,
            args.certificateKey as string
          )
          break
        case 'delete_certificate':
          if (!args?.resourceId) {
            throw new Error('resourceId is required for delete_certificate action')
          }
          result = await getDokployClient().removeCertificate(args.resourceId as string)
          break
        case 'list_registries':
          result = await getDokployClient().getAllRegistries()
          break
        case 'get_registry':
          if (!args?.resourceId) {
            throw new Error('resourceId is required for get_registry action')
          }
          result = await getDokployClient().getRegistry(args.resourceId as string)
          break
        case 'create_registry':
          if (!args?.name || !args?.registryUrl || !args?.username || !args?.password) {
            throw new Error('name, registryUrl, username, and password are required for create_registry action')
          }
          result = await getDokployClient().createRegistry(
            args.name as string,
            args.registryUrl as string,
            args.username as string,
            args.password as string
          )
          break
        case 'delete_registry':
          if (!args?.resourceId) {
            throw new Error('resourceId is required for delete_registry action')
          }
          result = await getDokployClient().removeRegistry(args.resourceId as string)
          break
        default:
          throw new Error(`Unknown action: ${action}. Supported actions: list_ssh_keys, get_ssh_key, create_ssh_key, generate_ssh_key, delete_ssh_key, list_certificates, get_certificate, create_certificate, delete_certificate, list_registries, get_registry, create_registry, delete_registry`)
      }
    }
    // Handle dokploy_ai tool
    else if (name === 'dokploy_ai') {
      const action = args?.action as string
      
      switch (action) {
        case 'list':
          result = await getDokployClient().getAiModels()
          break
        case 'get':
          if (!args?.aiId) {
            throw new Error('aiId is required for get action')
          }
          result = await getDokployClient().getAi(args.aiId as string)
          break
        case 'create':
          if (!args?.projectId || !args?.name) {
            throw new Error('projectId and name are required for create action')
          }
          result = await getDokployClient().createAi(
            args.projectId as string,
            args.name as string,
            args?.model as string || 'default',
            args?.config as Record<string, any> || {}
          )
          break
        case 'delete':
          if (!args?.aiId) {
            throw new Error('aiId is required for delete action')
          }
          result = await getDokployClient().deleteAi(args.aiId as string)
          break
        case 'get_suggestions':
          if (!args?.prompt || !args?.aiId) {
            throw new Error('prompt and aiId are required for get_suggestions action')
          }
          result = await getDokployClient().getAiSuggestions(args.prompt as string, args.aiId as string)
          break
        default:
          throw new Error(`Unknown action: ${action}. Supported actions: list, get, create, delete, get_suggestions`)
      }
    }
    // Handle dokploy_admin tool
    else if (name === 'dokploy_admin') {
      const action = args?.action as string
      
      switch (action) {
        case 'list_users':
          result = await getDokployClient().getAllUsers()
          break
        case 'get_user':
          if (!args?.userId) {
            throw new Error('userId is required for get_user action')
          }
          result = await getDokployClient().getUser(args.userId as string)
          break
        case 'create_user':
          if (!args?.email || !args?.password) {
            throw new Error('email and password are required for create_user action')
          }
          result = await getDokployClient().createUser(
            args.email as string,
            args.password as string,
            args?.role as string | undefined
          )
          break
        case 'delete_user':
          if (!args?.userId) {
            throw new Error('userId is required for delete_user action')
          }
          result = await getDokployClient().removeUser(args.userId as string)
          break
        default:
          throw new Error(`Unknown action: ${action}. Supported actions: list_users, get_user, create_user, delete_user`)
      }
    }
    // Handle dokploy_compose tool
    else if (name === 'dokploy_compose') {
      const action = args?.action as string
      
      switch (action) {
        case 'list':
          result = await getDokployClient().getComposeTemplates()
          break
        case 'get':
          if (!args?.composeId) {
            throw new Error('composeId is required for get action')
          }
          result = await getDokployClient().getCompose(args.composeId as string)
          break
        case 'create':
          if (!args?.projectId || !args?.name || !args?.composeFile) {
            throw new Error('projectId, name, and composeFile are required for create action')
          }
          result = await getDokployClient().createCompose(
            args.projectId as string,
            args.name as string,
            args.composeFile as string
          )
          break
        case 'update':
          if (!args?.composeId) {
            throw new Error('composeId is required for update action')
          }
          const composeUpdateData: Record<string, any> = {}
          if (args?.name) composeUpdateData.name = args.name
          if (args?.composeFile) composeUpdateData.composeFile = args.composeFile
          result = await getDokployClient().updateCompose(args.composeId as string, composeUpdateData)
          break
        case 'delete':
          if (!args?.composeId) {
            throw new Error('composeId is required for delete action')
          }
          result = await getDokployClient().deleteCompose(args.composeId as string)
          break
        case 'deploy':
          if (!args?.composeId) {
            throw new Error('composeId is required for deploy action')
          }
          result = await getDokployClient().deployCompose(args.composeId as string)
          break
        case 'start':
          if (!args?.composeId) {
            throw new Error('composeId is required for start action')
          }
          result = await getDokployClient().startCompose(args.composeId as string)
          break
        case 'stop':
          if (!args?.composeId) {
            throw new Error('composeId is required for stop action')
          }
          result = await getDokployClient().stopCompose(args.composeId as string)
          break
        case 'redeploy':
          if (!args?.composeId) {
            throw new Error('composeId is required for redeploy action')
          }
          result = await getDokployClient().redeployCompose(args.composeId as string)
          break
        default:
          throw new Error(`Unknown action: ${action}. Supported actions: list, get, create, update, delete, deploy, start, stop, redeploy`)
      }
    }
    else {
      throw new Error(`Unknown tool: ${name}. Available tools: dokploy_project, dokploy_application, dokploy_server, dokploy_docker, dokploy_domain, dokploy_monitoring, dokploy_diagnostics, dokploy_deployment, dokploy_database, dokploy_backup, dokploy_security, dokploy_ai, dokploy_admin, dokploy_compose, dokploy_system`)
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    }
  }
})

// Store transport reference for graceful shutdown
let transport: StdioServerTransport | null = null

// Graceful shutdown handler
async function shutdown(signal: string) {
  console.error(`\n${signal} received, shutting down gracefully...`)
  
  try {
    // Cleanup DokployClient resources (intervals, timers)
    if (dokployClient) {
      dokployClient.cleanup()
    }
    
    // Close server connection if transport exists
    if (transport) {
      // Note: MCP SDK doesn't expose a close method on transport,
      // but we can at least clean up our resources
      console.error('Cleaning up MCP server resources...')
    }
    
    console.error('Shutdown complete')
    process.exit(0)
  } catch (error) {
    console.error('Error during shutdown:', error)
    process.exit(1)
  }
}

// Register signal handlers for graceful shutdown
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error)
  shutdown('uncaughtException').catch(() => process.exit(1))
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason)
  shutdown('unhandledRejection').catch(() => process.exit(1))
})

// Start the server
async function main() {
  try {
    transport = new StdioServerTransport()
    await server.connect(transport)

    // Critical: Keep stdin open to maintain the connection
    process.stdin.resume()

    // Only log after successful connection (to stderr)
    console.error(`Dokploy MCP server v2.0.0 ready with ${Object.keys(toolSchemas).length} tools`)
  } catch (error) {
    console.error('Fatal error in MCP server:', error)
    await shutdown('startup-error')
  }
}

// Start immediately
main().catch(async (error) => {
  console.error('Fatal error during startup:', error)
  await shutdown('startup-fatal')
})
