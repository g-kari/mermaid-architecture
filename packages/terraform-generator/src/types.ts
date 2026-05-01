export interface TerraformNode {
  id: string;
  type: string;
  label: string;
  specs?: Record<string, string>;
}

export interface TerraformEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface TerraformGroup {
  id: string;
  type: string;
  label: string;
  children: string[];
}

export interface TerraformInput {
  nodes: TerraformNode[];
  edges: TerraformEdge[];
  groups: TerraformGroup[];
}

export interface TerraformMapping {
  resource: string;
  specMap: Record<string, string>;
  extraAttrs?: Record<string, string>;
}

export interface TerraformOptions {
  region?: string;
  providerVersion?: string;
  serviceLabelResolver?: (type: string) => string | undefined;
}
