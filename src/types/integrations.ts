import type { IntegrationStatus } from "./common";

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: IntegrationStatus;
  category: "source_control" | "communication" | "deployment" | "monitoring" | "ai" | "database" | "payment" | "automation";
  connectedAt?: string;
  lastSync?: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: "active" | "inactive";
  lastDelivery?: string;
  successRate: number;
}
