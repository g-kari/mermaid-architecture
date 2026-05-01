#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createClient } from "./api-client.js";
import { AWS_SERVICES, getServiceDef, getServicesByCategory } from "./aws-services.js";
import { canvasDataToMarkdown, canvasDataToMermaid } from "./generators.js";
import type { CanvasEdge, CanvasGroup, CanvasNode } from "./types.js";

const server = new McpServer({
  name: "mermaid-architecture",
  version: "0.1.0",
});

const client = createClient();

function ok(result: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
}

function err(e: unknown) {
  const message = e instanceof Error ? e.message : String(e);
  return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true };
}

server.tool("list_projects", {}, async () => {
  try {
    return ok(await client.listProjects());
  } catch (e) {
    return err(e);
  }
});

server.tool("create_project", { name: z.string() }, async ({ name }) => {
  try {
    return ok(await client.createProject(name));
  } catch (e) {
    return err(e);
  }
});

server.tool("list_diagrams", { projectId: z.string() }, async ({ projectId }) => {
  try {
    return ok(await client.listDiagrams(projectId));
  } catch (e) {
    return err(e);
  }
});

server.tool(
  "create_diagram",
  { projectId: z.string(), name: z.string() },
  async ({ projectId, name }) => {
    try {
      return ok(await client.createDiagram(projectId, name));
    } catch (e) {
      return err(e);
    }
  },
);

server.tool("get_diagram", { diagramId: z.string() }, async ({ diagramId }) => {
  try {
    const diagram = await client.getDiagram(diagramId);
    const result = {
      ...diagram,
      canvas_data: diagram.canvas_data ? JSON.parse(diagram.canvas_data) : null,
    };
    return ok(result);
  } catch (e) {
    return err(e);
  }
});

server.tool("delete_diagram", { diagramId: z.string() }, async ({ diagramId }) => {
  try {
    await client.deleteDiagram(diagramId);
    return ok({ deleted: true, diagramId });
  } catch (e) {
    return err(e);
  }
});

server.tool(
  "add_node",
  {
    diagramId: z.string(),
    serviceType: z.string(),
    label: z.string(),
    x: z.number().optional().default(100),
    y: z.number().optional().default(100),
    specs: z.record(z.string()).optional(),
    groupId: z.string().optional(),
  },
  async ({ diagramId, serviceType, label, x, y, specs, groupId }) => {
    try {
      const data = await client.getCanvasData(diagramId);
      const serviceDef = getServiceDef(serviceType);
      const width = serviceDef?.defaultWidth ?? 80;
      const height = serviceDef?.defaultHeight ?? 80;

      const node: CanvasNode = {
        id: randomUUID().slice(0, 8),
        type: serviceType,
        label,
        x,
        y,
        width,
        height,
        specs: specs ?? {},
      };

      if (groupId) {
        node.group = groupId;
        const group = data.groups.find((g) => g.id === groupId);
        if (group) {
          group.children.push(node.id);
        }
      }

      data.nodes.push(node);
      await client.saveCanvasData(diagramId, data);
      return ok(node);
    } catch (e) {
      return err(e);
    }
  },
);

server.tool(
  "remove_node",
  { diagramId: z.string(), nodeId: z.string() },
  async ({ diagramId, nodeId }) => {
    try {
      const data = await client.getCanvasData(diagramId);
      data.nodes = data.nodes.filter((n) => n.id !== nodeId);
      data.edges = data.edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
      for (const group of data.groups) {
        group.children = group.children.filter((c) => c !== nodeId);
      }
      await client.saveCanvasData(diagramId, data);
      return ok({ removed: true, nodeId });
    } catch (e) {
      return err(e);
    }
  },
);

server.tool(
  "update_node",
  {
    diagramId: z.string(),
    nodeId: z.string(),
    label: z.string().optional(),
    x: z.number().optional(),
    y: z.number().optional(),
    specs: z.record(z.string()).optional(),
  },
  async ({ diagramId, nodeId, label, x, y, specs }) => {
    try {
      const data = await client.getCanvasData(diagramId);
      const node = data.nodes.find((n) => n.id === nodeId);
      if (!node) {
        throw new Error(`Node not found: ${nodeId}`);
      }
      if (label !== undefined) node.label = label;
      if (x !== undefined) node.x = x;
      if (y !== undefined) node.y = y;
      if (specs !== undefined) node.specs = specs;
      await client.saveCanvasData(diagramId, data);
      return ok(node);
    } catch (e) {
      return err(e);
    }
  },
);

server.tool(
  "connect_nodes",
  {
    diagramId: z.string(),
    sourceNodeId: z.string(),
    targetNodeId: z.string(),
    label: z.string().optional(),
    style: z.enum(["solid", "dashed", "dotted"]).optional(),
  },
  async ({ diagramId, sourceNodeId, targetNodeId, label, style }) => {
    try {
      const data = await client.getCanvasData(diagramId);
      if (!data.nodes.find((n) => n.id === sourceNodeId)) {
        throw new Error(`Source node not found: ${sourceNodeId}`);
      }
      if (!data.nodes.find((n) => n.id === targetNodeId)) {
        throw new Error(`Target node not found: ${targetNodeId}`);
      }

      const edge: CanvasEdge = {
        id: randomUUID().slice(0, 8),
        source: sourceNodeId,
        target: targetNodeId,
      };
      if (label) edge.label = label;
      if (style) edge.style = style;

      data.edges.push(edge);
      await client.saveCanvasData(diagramId, data);
      return ok(edge);
    } catch (e) {
      return err(e);
    }
  },
);

server.tool(
  "disconnect_nodes",
  { diagramId: z.string(), edgeId: z.string() },
  async ({ diagramId, edgeId }) => {
    try {
      const data = await client.getCanvasData(diagramId);
      data.edges = data.edges.filter((e) => e.id !== edgeId);
      await client.saveCanvasData(diagramId, data);
      return ok({ removed: true, edgeId });
    } catch (e) {
      return err(e);
    }
  },
);

server.tool(
  "add_group",
  {
    diagramId: z.string(),
    type: z.enum(["vpc", "subnet", "az", "region", "generic"]),
    label: z.string(),
    childNodeIds: z.array(z.string()).optional(),
  },
  async ({ diagramId, type, label, childNodeIds }) => {
    try {
      const data = await client.getCanvasData(diagramId);
      const group: CanvasGroup = {
        id: randomUUID().slice(0, 8),
        type,
        label,
        children: childNodeIds ?? [],
      };

      for (const nodeId of group.children) {
        const node = data.nodes.find((n) => n.id === nodeId);
        if (node) {
          node.group = group.id;
        }
      }

      data.groups.push(group);
      await client.saveCanvasData(diagramId, data);
      return ok(group);
    } catch (e) {
      return err(e);
    }
  },
);

server.tool(
  "remove_group",
  { diagramId: z.string(), groupId: z.string() },
  async ({ diagramId, groupId }) => {
    try {
      const data = await client.getCanvasData(diagramId);
      data.groups = data.groups.filter((g) => g.id !== groupId);
      for (const node of data.nodes) {
        if (node.group === groupId) {
          node.group = undefined;
        }
      }
      await client.saveCanvasData(diagramId, data);
      return ok({ removed: true, groupId });
    } catch (e) {
      return err(e);
    }
  },
);

server.tool(
  "add_node_to_group",
  { diagramId: z.string(), nodeId: z.string(), groupId: z.string() },
  async ({ diagramId, nodeId, groupId }) => {
    try {
      const data = await client.getCanvasData(diagramId);
      const group = data.groups.find((g) => g.id === groupId);
      if (!group) {
        throw new Error(`Group not found: ${groupId}`);
      }
      const node = data.nodes.find((n) => n.id === nodeId);
      if (!node) {
        throw new Error(`Node not found: ${nodeId}`);
      }
      if (!group.children.includes(nodeId)) {
        group.children.push(nodeId);
      }
      node.group = groupId;
      await client.saveCanvasData(diagramId, data);
      return ok({ nodeId, groupId });
    } catch (e) {
      return err(e);
    }
  },
);

server.tool("list_aws_services", { category: z.string().optional() }, async ({ category }) => {
  try {
    if (category) {
      const filtered = AWS_SERVICES.filter((s) => s.category === category);
      return ok(filtered);
    }
    const byCategory = getServicesByCategory();
    const result: Record<string, unknown[]> = {};
    for (const [cat, services] of byCategory) {
      result[cat] = services.map((s) => ({
        id: s.id,
        name: s.name,
        specFields: s.specFields ?? [],
      }));
    }
    return ok(result);
  } catch (e) {
    return err(e);
  }
});

server.tool("generate_mermaid", { diagramId: z.string() }, async ({ diagramId }) => {
  try {
    const data = await client.getCanvasData(diagramId);
    const mermaid = canvasDataToMermaid(data);
    return ok({ mermaid });
  } catch (e) {
    return err(e);
  }
});

server.tool("generate_markdown", { diagramId: z.string() }, async ({ diagramId }) => {
  try {
    const data = await client.getCanvasData(diagramId);
    const markdown = canvasDataToMarkdown(data);
    return ok({ markdown });
  } catch (e) {
    return err(e);
  }
});

server.tool(
  "create_snapshot",
  { diagramId: z.string(), label: z.string().optional() },
  async ({ diagramId, label }) => {
    try {
      await client.createSnapshot(diagramId, label);
      return ok({ created: true, diagramId, label });
    } catch (e) {
      return err(e);
    }
  },
);

server.tool("list_snapshots", { diagramId: z.string() }, async ({ diagramId }) => {
  try {
    return ok(await client.listSnapshots(diagramId));
  } catch (e) {
    return err(e);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
