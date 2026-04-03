/**
 * Project-aware fetch wrapper.
 * Automatically includes x-project-id header from the projects store.
 */

export function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  // Dynamically import to avoid circular dependency
  const { useProjectsStore } = require("@/stores/projects-store");
  const projectId = useProjectsStore.getState().activeProjectId;

  const headers = new Headers(options?.headers);
  if (projectId && projectId !== "default") {
    headers.set("x-project-id", projectId);
  }

  return fetch(url, { ...options, headers });
}
