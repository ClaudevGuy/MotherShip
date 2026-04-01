import type { DeployStage, DeployStatus, Environment, HealthStatus } from "./common";

export interface Deployment {
  id: string;
  service: string;
  version: string;
  stage: DeployStage;
  status: DeployStatus;
  timestamp: string;
  duration: number;
  triggeredBy: string;
  isAgent: boolean;
  commitHash: string;
  changelog: string;
  environment: Environment;
}

export interface EnvironmentStatus {
  name: Environment;
  status: HealthStatus;
  lastDeploy: string;
  currentVersion: string;
  uptime: number;
  activeUsers: number;
  healthChecks: { name: string; status: HealthStatus }[];
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  environments: Record<Environment, boolean>;
}
