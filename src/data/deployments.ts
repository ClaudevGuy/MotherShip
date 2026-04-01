import type { Deployment, EnvironmentStatus, FeatureFlag } from "@/types/deployments";
import { relativeTimestamp } from "./generators";

export const seedDeployments: Deployment[] = [
  { id: "dep_001", service: "api-gateway", version: "v2.14.3", stage: "production", status: "in_progress", timestamp: relativeTimestamp(8), duration: 0, triggeredBy: "DeployBot", isAgent: true, commitHash: "a3f8c21", changelog: "Add rate limiting middleware, fix CORS headers", environment: "production" },
  { id: "dep_002", service: "api-gateway", version: "v2.14.2", stage: "production", status: "success", timestamp: relativeTimestamp(45), duration: 184, triggeredBy: "DeployBot", isAgent: true, commitHash: "b7d2e94", changelog: "Update auth middleware, patch session handling", environment: "production" },
  { id: "dep_003", service: "web-app", version: "v2.14.3-rc.1", stage: "staging", status: "success", timestamp: relativeTimestamp(120), duration: 156, triggeredBy: "Marcus Johnson", isAgent: false, commitHash: "c1e4f67", changelog: "New dashboard components, analytics charts", environment: "staging" },
  { id: "dep_004", service: "worker-service", version: "v2.14.2", stage: "production", status: "success", timestamp: relativeTimestamp(360), duration: 98, triggeredBy: "DeployBot", isAgent: true, commitHash: "d5a8b31", changelog: "Optimize ETL pipeline, add retry logic", environment: "production" },
  { id: "dep_005", service: "analytics-service", version: "v1.8.4", stage: "production", status: "success", timestamp: relativeTimestamp(720), duration: 134, triggeredBy: "James Wilson", isAgent: false, commitHash: "e9c2d45", changelog: "Add geo-tracking, update retention queries", environment: "production" },
  { id: "dep_006", service: "notification-service", version: "v1.3.1", stage: "production", status: "success", timestamp: relativeTimestamp(1080), duration: 67, triggeredBy: "DeployBot", isAgent: true, commitHash: "f3g6h89", changelog: "Fix push notification delivery, add email templates", environment: "production" },
  { id: "dep_007", service: "api-gateway", version: "v2.14.1-rc.2", stage: "staging", status: "failed", timestamp: relativeTimestamp(2880), duration: 98, triggeredBy: "DeployBot", isAgent: true, commitHash: "g7h0i23", changelog: "Attempted database migration with schema conflict", environment: "staging" },
  { id: "dep_008", service: "api-gateway", version: "v2.14.0", stage: "production", status: "rolled_back", timestamp: relativeTimestamp(2910), duration: 45, triggeredBy: "DeployBot", isAgent: true, commitHash: "h1i4j56", changelog: "Auto-rollback after failed health check", environment: "production" },
  { id: "dep_009", service: "web-app", version: "v2.14.2", stage: "production", status: "success", timestamp: relativeTimestamp(4320), duration: 167, triggeredBy: "Aisha Patel", isAgent: false, commitHash: "i5j8k90", changelog: "UI refresh, component library update, accessibility fixes", environment: "production" },
  { id: "dep_010", service: "ml-pipeline", version: "v0.9.2", stage: "dev", status: "success", timestamp: relativeTimestamp(180), duration: 245, triggeredBy: "CodeReviewer", isAgent: true, commitHash: "j9k2l34", changelog: "Update model weights, add feature extraction", environment: "development" },
  { id: "dep_011", service: "cache-service", version: "v1.1.0", stage: "production", status: "success", timestamp: relativeTimestamp(5760), duration: 34, triggeredBy: "Sarah Chen", isAgent: false, commitHash: "k3l6m78", changelog: "Redis cluster upgrade, add eviction policies", environment: "production" },
  { id: "dep_012", service: "search-service", version: "v2.3.1", stage: "staging", status: "pending", timestamp: relativeTimestamp(30), duration: 0, triggeredBy: "Marcus Johnson", isAgent: false, commitHash: "l7m0n12", changelog: "Elasticsearch index optimization, fuzzy matching update", environment: "staging" },
  { id: "dep_013", service: "web-app", version: "v2.14.4-dev.1", stage: "dev", status: "success", timestamp: relativeTimestamp(60), duration: 89, triggeredBy: "TestWriter", isAgent: true, commitHash: "m1n4o56", changelog: "Add test fixtures, update snapshot tests", environment: "development" },
  { id: "dep_014", service: "auth-service", version: "v3.0.0-beta.1", stage: "staging", status: "success", timestamp: relativeTimestamp(1440), duration: 112, triggeredBy: "Aisha Patel", isAgent: false, commitHash: "n5o8p90", changelog: "OAuth2 PKCE support, MFA improvements", environment: "staging" },
  { id: "dep_015", service: "api-gateway", version: "v2.14.1", stage: "production", status: "success", timestamp: relativeTimestamp(7200), duration: 192, triggeredBy: "DeployBot", isAgent: true, commitHash: "o9p2q34", changelog: "Performance improvements, connection pooling update", environment: "production" },
];

export const seedEnvironments: EnvironmentStatus[] = [
  {
    name: "production",
    status: "healthy",
    lastDeploy: relativeTimestamp(8),
    currentVersion: "v2.14.3",
    uptime: 99.98,
    activeUsers: 1247,
    healthChecks: [
      { name: "API Gateway", status: "healthy" },
      { name: "Database", status: "healthy" },
      { name: "Cache", status: "healthy" },
      { name: "Worker Queue", status: "healthy" },
      { name: "CDN", status: "healthy" },
      { name: "Auth Service", status: "healthy" },
    ],
  },
  {
    name: "staging",
    status: "degraded",
    lastDeploy: relativeTimestamp(30),
    currentVersion: "v2.14.3-rc.1",
    uptime: 99.42,
    activeUsers: 23,
    healthChecks: [
      { name: "API Gateway", status: "healthy" },
      { name: "Database", status: "healthy" },
      { name: "Cache", status: "degraded" },
      { name: "Worker Queue", status: "healthy" },
      { name: "CDN", status: "healthy" },
      { name: "Auth Service", status: "healthy" },
    ],
  },
  {
    name: "development",
    status: "healthy",
    lastDeploy: relativeTimestamp(60),
    currentVersion: "v2.14.4-dev.1",
    uptime: 97.81,
    activeUsers: 8,
    healthChecks: [
      { name: "API Gateway", status: "healthy" },
      { name: "Database", status: "healthy" },
      { name: "Cache", status: "healthy" },
      { name: "Worker Queue", status: "down" },
      { name: "CDN", status: "healthy" },
      { name: "Auth Service", status: "healthy" },
    ],
  },
];

export const seedFeatureFlags: FeatureFlag[] = [
  { id: "ff_001", name: "new-dashboard", description: "Redesigned analytics dashboard with real-time charts", environments: { development: true, staging: true, production: true } },
  { id: "ff_002", name: "ai-code-suggestions", description: "AI-powered inline code suggestions in the editor", environments: { development: true, staging: true, production: false } },
  { id: "ff_003", name: "batch-operations", description: "Bulk actions for claim processing", environments: { development: true, staging: true, production: true } },
  { id: "ff_004", name: "advanced-search", description: "Elasticsearch-powered full-text search with fuzzy matching", environments: { development: true, staging: true, production: false } },
  { id: "ff_005", name: "dark-mode-v2", description: "Enhanced dark mode with custom color schemes", environments: { development: true, staging: false, production: false } },
  { id: "ff_006", name: "webhook-v2", description: "New webhook delivery system with retry and DLQ", environments: { development: true, staging: true, production: true } },
];
