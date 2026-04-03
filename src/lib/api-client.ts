/**
 * Project-aware fetch wrapper.
 * Automatically includes x-project-id header from the projects store.
 */

import { useProjectsStore } from "@/stores/projects-store";

export function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const projectId = useProjectsStore.getState().activeProjectId;

  const headers = new Headers(options?.headers);
  if (projectId && projectId !== "default") {
    headers.set("x-project-id", projectId);
  }

  return fetch(url, { ...options, headers });
}
