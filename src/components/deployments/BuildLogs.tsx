"use client";

import React from "react";
import { CodeBlock } from "@/components/shared";

const MOCK_BUILD_LOG = `[10:42:01] Starting build pipeline...
[10:42:01] Fetching source from git@github.com:recoupfi/api-gateway.git
[10:42:03] Checked out commit a3f8c21 (branch: main)
[10:42:03] Installing dependencies...
[10:42:18] npm install completed (1,247 packages)
[10:42:18] Running lint checks...
[10:42:22] Lint passed (0 errors, 2 warnings)
[10:42:22] WARN: Unused import in src/middleware/cors.ts:3
[10:42:22] WARN: Missing return type in src/handlers/claims.ts:47
[10:42:22] Running type checks...
[10:42:28] TypeScript compilation successful
[10:42:28] Running unit tests...
[10:42:45] 342 tests passed, 0 failed, 0 skipped
[10:42:45] Code coverage: 87.3% (threshold: 80%)
[10:42:45] Building Docker image...
[10:42:58] Image built: recoupfi/api-gateway:v2.14.3-a3f8c21
[10:42:58] Pushing to container registry...
[10:43:05] Image pushed successfully
[10:43:05] Deploying to production cluster...
[10:43:12] Rolling update started (3 replicas)
[10:43:18] Pod api-gateway-7f8d9-abc12 ready
[10:43:24] Pod api-gateway-7f8d9-def34 ready
[10:43:30] Pod api-gateway-7f8d9-ghi56 ready
[10:43:30] Health check passed on all pods
[10:43:31] Deployment complete - v2.14.3 is live`;

export function BuildLogs() {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Build Logs</h3>
      <CodeBlock
        code={MOCK_BUILD_LOG}
        language="log"
        maxHeight={360}
        showCopy={true}
      />
    </div>
  );
}
