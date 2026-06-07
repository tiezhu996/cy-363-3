export interface FeatureItem {
  id: number;
  title: string;
  description: string;
  status: string;
  metric: string;
}

export interface KpiItem {
  label: string;
  value: string;
  trend: string;
  tone: string;
}

export interface OperationRecord {
  key: string;
  name: string;
  owner: string;
  status: string;
  metric: string;
  priority: string;
}

export interface OverviewResponse {
  appName: string;
  appCode: string;
  description: string;
  features: FeatureItem[];
  kpis: KpiItem[];
  records: OperationRecord[];
}

export interface Theme {
  id: number;
  name: string;
  type: string;
  difficulty: number;
  minPlayers: number;
  maxPlayers: number;
  duration: number;
  status: "online" | "offline";
  createdAt: string;
  updatedAt: string;
}

export interface ThemeCreateInput {
  name: string;
  type: string;
  difficulty: number;
  minPlayers: number;
  maxPlayers: number;
  duration: number;
}

export interface ThemeUpdateInput {
  name?: string;
  type?: string;
  difficulty?: number;
  minPlayers?: number;
  maxPlayers?: number;
  duration?: number;
  status?: "online" | "offline";
}

export interface ThemeListResponse {
  data: Theme[];
  total: number;
}

export interface ThemeResponse {
  data: Theme;
  message?: string;
}

export interface ThemeTypesResponse {
  data: string[];
}
