import type { Repository, Commit, PullRequest, CodeHealthScore } from "@/types/codebase";
import { relativeTimestamp } from "./generators";

export const seedRepositories: Repository[] = [
  { id: "repo_001", name: "recoupfi/platform", url: "https://github.com/recoupfi/platform", lastCommit: relativeTimestamp(3), branch: "main", ciStatus: "passing", language: "TypeScript" },
  { id: "repo_002", name: "recoupfi/agent-runtime", url: "https://github.com/recoupfi/agent-runtime", lastCommit: relativeTimestamp(45), branch: "main", ciStatus: "passing", language: "TypeScript" },
  { id: "repo_003", name: "recoupfi/infra", url: "https://github.com/recoupfi/infra", lastCommit: relativeTimestamp(720), branch: "main", ciStatus: "pending", language: "HCL" },
];

export const seedCommits: Commit[] = [
  { id: "cmt_001", hash: "a3f8c21", message: "feat: add rate limiting middleware for API gateway", author: "Marcus Johnson", isAgent: false, timestamp: relativeTimestamp(3), filesChanged: 4, additions: 142, deletions: 12 },
  { id: "cmt_002", hash: "b7d2e94", message: "fix: patch session handling race condition", author: "CodeReviewer", isAgent: true, timestamp: relativeTimestamp(28), filesChanged: 2, additions: 34, deletions: 18 },
  { id: "cmt_003", hash: "c1e4f67", message: "feat: new analytics dashboard components", author: "Aisha Patel", isAgent: false, timestamp: relativeTimestamp(55), filesChanged: 12, additions: 890, deletions: 124 },
  { id: "cmt_004", hash: "d5a8b31", message: "perf: optimize ETL pipeline batch processing", author: "DataPipelineAgent", isAgent: true, timestamp: relativeTimestamp(120), filesChanged: 3, additions: 67, deletions: 45 },
  { id: "cmt_005", hash: "e9c2d45", message: "feat: add geo-tracking for analytics", author: "James Wilson", isAgent: false, timestamp: relativeTimestamp(180), filesChanged: 6, additions: 234, deletions: 0 },
  { id: "cmt_006", hash: "f3g6h89", message: "fix: push notification delivery for expired tokens", author: "BugHunter", isAgent: true, timestamp: relativeTimestamp(240), filesChanged: 2, additions: 28, deletions: 8 },
  { id: "cmt_007", hash: "g7h0i23", message: "test: add integration tests for auth middleware", author: "TestWriter", isAgent: true, timestamp: relativeTimestamp(310), filesChanged: 3, additions: 312, deletions: 0 },
  { id: "cmt_008", hash: "h1i4j56", message: "docs: update API reference for v2.14", author: "DocGenerator", isAgent: true, timestamp: relativeTimestamp(370), filesChanged: 8, additions: 456, deletions: 189 },
  { id: "cmt_009", hash: "i5j8k90", message: "feat: UI refresh with new component library", author: "Aisha Patel", isAgent: false, timestamp: relativeTimestamp(420), filesChanged: 24, additions: 1240, deletions: 890 },
  { id: "cmt_010", hash: "j9k2l34", message: "fix: CORS configuration for production origins", author: "SecurityScanner", isAgent: true, timestamp: relativeTimestamp(500), filesChanged: 1, additions: 12, deletions: 3 },
  { id: "cmt_011", hash: "k3l6m78", message: "chore: Redis cluster upgrade configuration", author: "Sarah Chen", isAgent: false, timestamp: relativeTimestamp(560), filesChanged: 3, additions: 45, deletions: 23 },
  { id: "cmt_012", hash: "l7m0n12", message: "feat: Elasticsearch fuzzy matching for search", author: "Marcus Johnson", isAgent: false, timestamp: relativeTimestamp(620), filesChanged: 5, additions: 178, deletions: 34 },
  { id: "cmt_013", hash: "m1n4o56", message: "test: snapshot tests for dashboard components", author: "TestWriter", isAgent: true, timestamp: relativeTimestamp(680), filesChanged: 14, additions: 567, deletions: 0 },
  { id: "cmt_014", hash: "n5o8p90", message: "feat: OAuth2 PKCE support for auth service", author: "Aisha Patel", isAgent: false, timestamp: relativeTimestamp(720), filesChanged: 7, additions: 345, deletions: 78 },
  { id: "cmt_015", hash: "o9p2q34", message: "perf: connection pooling improvements", author: "PerformanceOptimizer", isAgent: true, timestamp: relativeTimestamp(840), filesChanged: 2, additions: 56, deletions: 34 },
  { id: "cmt_016", hash: "p3q6r78", message: "fix: pagination off-by-one error", author: "BugHunter", isAgent: true, timestamp: relativeTimestamp(960), filesChanged: 1, additions: 8, deletions: 4 },
  { id: "cmt_017", hash: "q7r0s12", message: "chore: update dependencies and lock file", author: "Marcus Johnson", isAgent: false, timestamp: relativeTimestamp(1080), filesChanged: 2, additions: 234, deletions: 189 },
  { id: "cmt_018", hash: "r1s4t56", message: "feat: batch claim processing API endpoints", author: "APIDesigner", isAgent: true, timestamp: relativeTimestamp(1200), filesChanged: 5, additions: 289, deletions: 0 },
  { id: "cmt_019", hash: "s5t8u90", message: "security: fix SQL injection in query builder", author: "SecurityScanner", isAgent: true, timestamp: relativeTimestamp(1440), filesChanged: 3, additions: 24, deletions: 18 },
  { id: "cmt_020", hash: "t9u2v34", message: "feat: webhook retry with exponential backoff", author: "James Wilson", isAgent: false, timestamp: relativeTimestamp(1680), filesChanged: 4, additions: 156, deletions: 23 },
  { id: "cmt_021", hash: "u3v6w78", message: "test: unit tests for payment processor", author: "TestWriter", isAgent: true, timestamp: relativeTimestamp(1920), filesChanged: 2, additions: 234, deletions: 0 },
  { id: "cmt_022", hash: "v7w0x12", message: "docs: migration guide v2.13 to v2.14", author: "DocGenerator", isAgent: true, timestamp: relativeTimestamp(2160), filesChanged: 3, additions: 345, deletions: 12 },
  { id: "cmt_023", hash: "w1x4y56", message: "feat: dark mode v2 with custom color schemes", author: "Aisha Patel", isAgent: false, timestamp: relativeTimestamp(2400), filesChanged: 18, additions: 678, deletions: 234 },
  { id: "cmt_024", hash: "x5y8z90", message: "fix: memory leak in WebSocket connection pool", author: "BugHunter", isAgent: true, timestamp: relativeTimestamp(2880), filesChanged: 2, additions: 34, deletions: 12 },
  { id: "cmt_025", hash: "y9z2a34", message: "infra: Terraform module for auto-scaling groups", author: "Sarah Chen", isAgent: false, timestamp: relativeTimestamp(3360), filesChanged: 6, additions: 234, deletions: 0 },
];

export const seedPullRequests: PullRequest[] = [
  { id: "pr_847", title: "Add rate limiting middleware", author: "Marcus Johnson", status: "open", createdAt: relativeTimestamp(3), labels: ["feature", "api"], reviewers: ["Sarah Chen", "CodeReviewer"], additions: 142, deletions: 12 },
  { id: "pr_845", title: "Fix session handling race condition", author: "CodeReviewer", status: "merged", createdAt: relativeTimestamp(28), labels: ["bugfix", "agent-authored"], reviewers: ["Marcus Johnson"], additions: 34, deletions: 18 },
  { id: "pr_842", title: "New analytics dashboard components", author: "Aisha Patel", status: "merged", createdAt: relativeTimestamp(55), labels: ["feature", "frontend"], reviewers: ["Sarah Chen", "Marcus Johnson"], additions: 890, deletions: 124 },
  { id: "pr_840", title: "OAuth2 PKCE support", author: "Aisha Patel", status: "open", createdAt: relativeTimestamp(720), labels: ["feature", "security", "auth"], reviewers: ["Sarah Chen"], additions: 345, deletions: 78 },
  { id: "pr_838", title: "Batch claim processing API", author: "APIDesigner", status: "open", createdAt: relativeTimestamp(1200), labels: ["feature", "api", "agent-authored"], reviewers: ["James Wilson", "Aisha Patel"], additions: 289, deletions: 0 },
  { id: "pr_835", title: "Fix SQL injection vulnerability", author: "SecurityScanner", status: "merged", createdAt: relativeTimestamp(1440), labels: ["security", "critical", "agent-authored"], reviewers: ["Sarah Chen"], additions: 24, deletions: 18 },
  { id: "pr_832", title: "Elasticsearch fuzzy search", author: "Marcus Johnson", status: "merged", createdAt: relativeTimestamp(620), labels: ["feature", "search"], reviewers: ["Aisha Patel"], additions: 178, deletions: 34 },
  { id: "pr_830", title: "Dark mode v2 implementation", author: "Aisha Patel", status: "closed", createdAt: relativeTimestamp(2400), labels: ["feature", "frontend", "design"], reviewers: ["Marcus Johnson", "Emily Rodriguez"], additions: 678, deletions: 234 },
];

export const seedCodeHealth: CodeHealthScore = {
  overall: 82,
  testCoverage: 78,
  technicalDebt: 24,
  securityIssues: 3,
  dependencyFreshness: 89,
  aiCodeRatio: 34,
};
