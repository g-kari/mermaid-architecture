import type { CanvasData, Diagram, Project } from "./types.js";

export class ApiClient {
  constructor(
    private baseUrl: string,
    private userEmail: string,
  ) {}

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Dev-User-Email": this.userEmail,
        ...options.headers,
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `API request failed: ${options.method ?? "GET"} ${path} returned ${res.status} ${res.statusText}${body ? ` - ${body}` : ""}`,
      );
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return res.json() as Promise<T>;
  }

  async listProjects(): Promise<Project[]> {
    return this.request<Project[]>("/api/projects");
  }

  async createProject(name: string): Promise<{ id: string; name: string }> {
    return this.request<{ id: string; name: string }>("/api/projects", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/api/projects/${id}`);
  }

  async listDiagrams(projectId: string): Promise<Diagram[]> {
    return this.request<Diagram[]>(`/api/projects/${projectId}/diagrams`);
  }

  async createDiagram(
    projectId: string,
    name: string,
    canvasData?: CanvasData,
  ): Promise<{ id: string; name: string }> {
    return this.request<{ id: string; name: string }>(`/api/projects/${projectId}/diagrams`, {
      method: "POST",
      body: JSON.stringify({
        name,
        canvas_data: canvasData ? JSON.stringify(canvasData) : undefined,
      }),
    });
  }

  async getDiagram(id: string): Promise<Diagram> {
    return this.request<Diagram>(`/api/diagrams/${id}`);
  }

  async updateDiagram(id: string, updates: { name?: string; canvas_data?: string }): Promise<void> {
    await this.request<void>(`/api/diagrams/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteDiagram(id: string): Promise<void> {
    await this.request<void>(`/api/diagrams/${id}`, {
      method: "DELETE",
    });
  }

  async getCanvasData(diagramId: string): Promise<CanvasData> {
    const diagram = await this.getDiagram(diagramId);
    if (!diagram.canvas_data) {
      return { nodes: [], edges: [], groups: [] };
    }
    return JSON.parse(diagram.canvas_data) as CanvasData;
  }

  async saveCanvasData(diagramId: string, data: CanvasData): Promise<void> {
    await this.updateDiagram(diagramId, {
      canvas_data: JSON.stringify(data),
    });
  }

  async listSnapshots(diagramId: string): Promise<unknown[]> {
    return this.request<unknown[]>(`/api/diagrams/${diagramId}/snapshots`);
  }

  async createSnapshot(diagramId: string, label?: string): Promise<void> {
    await this.request<void>(`/api/diagrams/${diagramId}/snapshots`, {
      method: "POST",
      body: JSON.stringify({ label }),
    });
  }

  async listTemplates(): Promise<unknown[]> {
    return this.request<unknown[]>("/api/templates");
  }
}

export function createClient(): ApiClient {
  const baseUrl = process.env.MCP_API_URL ?? "http://localhost:8787";
  const userEmail = process.env.MCP_USER_EMAIL ?? "dev@example.com";
  return new ApiClient(baseUrl, userEmail);
}
