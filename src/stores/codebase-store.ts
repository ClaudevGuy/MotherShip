import { create } from "zustand";
import type { Repository, Commit, PullRequest, CodeHealthScore } from "@/types/codebase";
import { seedRepositories, seedCommits, seedPullRequests, seedCodeHealth } from "@/data/codebase";

interface CodebaseStore {
  repositories: Repository[];
  commits: Commit[];
  pullRequests: PullRequest[];
  codeHealth: CodeHealthScore;
  selectedRepo: string;
  prStatusFilter: "all" | "open" | "merged" | "closed";
  showAgentCommitsOnly: boolean;
  setSelectedRepo: (repo: string) => void;
  setPRStatusFilter: (status: "all" | "open" | "merged" | "closed") => void;
  setShowAgentCommitsOnly: (show: boolean) => void;
  getFilteredCommits: () => Commit[];
  getFilteredPRs: () => PullRequest[];
}

export const useCodebaseStore = create<CodebaseStore>((set, get) => ({
  repositories: seedRepositories,
  commits: seedCommits,
  pullRequests: seedPullRequests,
  codeHealth: seedCodeHealth,
  selectedRepo: "all",
  prStatusFilter: "all",
  showAgentCommitsOnly: false,

  setSelectedRepo: (repo) => set({ selectedRepo: repo }),
  setPRStatusFilter: (status) => set({ prStatusFilter: status }),
  setShowAgentCommitsOnly: (show) => set({ showAgentCommitsOnly: show }),

  getFilteredCommits: () => {
    const { commits, showAgentCommitsOnly } = get();
    if (showAgentCommitsOnly) return commits.filter((c) => c.isAgent);
    return commits;
  },

  getFilteredPRs: () => {
    const { pullRequests, prStatusFilter } = get();
    if (prStatusFilter === "all") return pullRequests;
    return pullRequests.filter((pr) => pr.status === prStatusFilter);
  },
}));
