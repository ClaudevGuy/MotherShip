export interface Repository {
  id: string;
  name: string;
  url: string;
  lastCommit: string;
  branch: string;
  ciStatus: "passing" | "failing" | "pending";
  language: string;
}

export interface Commit {
  id: string;
  hash: string;
  message: string;
  author: string;
  isAgent: boolean;
  timestamp: string;
  filesChanged: number;
  additions: number;
  deletions: number;
}

export interface PullRequest {
  id: string;
  title: string;
  author: string;
  status: "open" | "merged" | "closed";
  createdAt: string;
  labels: string[];
  reviewers: string[];
  additions: number;
  deletions: number;
}

export interface CodeHealthScore {
  overall: number;
  testCoverage: number;
  technicalDebt: number;
  securityIssues: number;
  dependencyFreshness: number;
  aiCodeRatio: number;
}
