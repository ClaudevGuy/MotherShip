import type { Integration, Webhook } from "@/types/integrations";
import { relativeTimestamp } from "./generators";

export const seedIntegrations: Integration[] = [
  { id: "int_001", name: "GitHub", description: "Source control, pull requests, and CI/CD integration", icon: "github", status: "connected", category: "source_control", connectedAt: "2025-07-15T00:00:00Z", lastSync: relativeTimestamp(3) },
  { id: "int_002", name: "Slack", description: "Team notifications, alerts, and incident communication", icon: "slack", status: "connected", category: "communication", connectedAt: "2025-07-15T00:00:00Z", lastSync: relativeTimestamp(1) },
  { id: "int_003", name: "Vercel", description: "Frontend deployment and preview environments", icon: "vercel", status: "connected", category: "deployment", connectedAt: "2025-08-01T00:00:00Z", lastSync: relativeTimestamp(8) },
  { id: "int_004", name: "AWS", description: "Cloud infrastructure, compute, storage, and databases", icon: "aws", status: "connected", category: "deployment", connectedAt: "2025-07-01T00:00:00Z", lastSync: relativeTimestamp(0) },
  { id: "int_005", name: "OpenAI", description: "GPT-4 API access for AI agents", icon: "openai", status: "connected", category: "ai", connectedAt: "2025-08-15T00:00:00Z", lastSync: relativeTimestamp(5) },
  { id: "int_006", name: "Anthropic", description: "Claude API access for AI agents", icon: "anthropic", status: "connected", category: "ai", connectedAt: "2025-09-01T00:00:00Z", lastSync: relativeTimestamp(1) },
  { id: "int_007", name: "Datadog", description: "Infrastructure monitoring, APM, and log management", icon: "datadog", status: "connected", category: "monitoring", connectedAt: "2025-10-01T00:00:00Z", lastSync: relativeTimestamp(0) },
  { id: "int_008", name: "PagerDuty", description: "Incident management and on-call scheduling", icon: "pagerduty", status: "disconnected", category: "monitoring" },
  { id: "int_009", name: "Jira", description: "Project management and issue tracking", icon: "jira", status: "disconnected", category: "automation" },
  { id: "int_010", name: "Linear", description: "Issue tracking and project management", icon: "linear", status: "connected", category: "automation", connectedAt: "2025-11-01T00:00:00Z", lastSync: relativeTimestamp(15) },
  { id: "int_011", name: "Sentry", description: "Error tracking and performance monitoring", icon: "sentry", status: "connected", category: "monitoring", connectedAt: "2025-09-15T00:00:00Z", lastSync: relativeTimestamp(2) },
  { id: "int_012", name: "Stripe", description: "Payment processing and billing management", icon: "stripe", status: "disconnected", category: "payment" },
];

export const seedWebhooks: Webhook[] = [
  { id: "wh_001", url: "https://partner-api.example.com/webhooks/claims", events: ["claim.created", "claim.updated", "claim.resolved"], status: "active", lastDelivery: relativeTimestamp(6), successRate: 98.2 },
  { id: "wh_002", url: "https://analytics.internal.recoupfi.com/events", events: ["agent.run.completed", "agent.run.failed", "deployment.completed"], status: "active", lastDelivery: relativeTimestamp(3), successRate: 99.8 },
  { id: "wh_003", url: "https://old-system.example.com/hooks/sync", events: ["claim.created"], status: "inactive", lastDelivery: relativeTimestamp(10080), successRate: 72.4 },
  { id: "wh_004", url: "https://compliance.recoupfi.com/audit", events: ["team.member.added", "api_key.created", "api_key.revoked", "settings.updated"], status: "active", lastDelivery: relativeTimestamp(12), successRate: 100 },
];
