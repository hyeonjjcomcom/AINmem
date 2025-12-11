export interface ConstantData {
  value?: string;
  name?: string;
  constant?: string;
  description?: string;
}

export interface NodeData {
  id: string;
  name: string;
  type: string;
  count: number;
  group: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface LinkData {
  source: string | NodeData;
  target: string | NodeData;
  predicates: string[];
  descriptions: string[];
  values: string[];
  count: number;
}

export interface FactItem {
  constants: string[];
  predicates: string[];
  description?: string;
  value?: string;
}

export interface GraphData {
  nodes: Map<string, NodeData>;
  links: LinkData[];
}

export interface FilterTag {
  id: string;
  label: string;
}