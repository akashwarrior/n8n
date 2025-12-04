import type { Projects, Workflows, Prisma } from "@n8n/db";

class ApiError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super();
    this.status = status;
    this.message = message;
  }
}

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => {});
    throw new ApiError(response.status, error.error || "Request failed");
  }

  return await response.json();
}

type workflowIdInput = { workflowId: string };
export type WorkflowUpdateInput = Prisma.WorkflowsUpdateInput & { id: string };
export type WorkflowCreateInput = Omit<
  Prisma.WorkflowsCreateInput,
  "project"
> & { projectId: string };

const workflows = {
  get: (data: workflowIdInput) =>
    apiCall<Workflows>(`/api/workflows/${data.workflowId}`),

  update: (data: WorkflowUpdateInput) =>
    apiCall<Workflows>(`/api/workflows/${data.id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (data: workflowIdInput) =>
    apiCall<Workflows>(`/api/workflows/${data.workflowId}`, {
      method: "DELETE",
    }),

  create: (data: WorkflowCreateInput) =>
    apiCall<Workflows>("/api/workflows", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export type projectCreateInput = Omit<Prisma.ProjectsCreateInput, "user">;
export type projectUpdateInput = Prisma.ProjectsUpdateInput & { id: string };

const projects = {
  get: () => {},
  create: (data: projectCreateInput) =>
    apiCall<Projects>("/api/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (data: projectUpdateInput) =>
    apiCall<Projects>(`/api/projects/${data.id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (data: { projectId: string }) =>
    apiCall<Projects>(`/api/projects/${data.projectId}`, {
      method: "DELETE",
    }),
};

export const api = {
  workflows,
  projects,
};
