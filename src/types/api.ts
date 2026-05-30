// ─────────────────────────────────────────────────────────────
// API type definitions — mirror the FastAPI/Pydantic schemas.
// Source of truth: api/router_chat.py, api/router_artifacts.py,
// api/router_rag.py and the project's openapi.json.
// ─────────────────────────────────────────────────────────────

export type OsTarget =
  | "ubuntu_22_04"
  | "ubuntu_24_04"
  | "windows_11"
  | "windows_server_2025";

export type UserRole = "sysadmin" | "soc" | "developer" | "devops" | "auditor";
export type SecurityLevel = "minimal" | "balanced" | "strict";
export type ZtMaturity = "low" | "medium" | "high";
export type ArtifactFormat = "bash" | "powershell" | "ansible" | "reg" | "gpo";

// ── /api/chat ────────────────────────────────────────────────
export interface ChatRequest {
  question: string;
  os?: OsTarget | null;
  role?: UserRole | null;
  security_level?: SecurityLevel;
  zt_maturity?: ZtMaturity;
  use_rag?: boolean;
  rag_top_k?: number;   // 1..20
  rag_min_score?: number; // 0..1
  stream?: boolean;
  timeout?: number; // 1..300
  session_id?: string | null;
}

export interface RagSource {
  id: string;
  score: number;
  source: string;
  section: string;
  text?: string | null;
  os_version?: string | null;
}

export interface ChatStats {
  total_time_s?: number;
  layer_path?: string;
  rag_used?: boolean;
  rag_chunks?: number;
  model?: string;
  complexity?: string;
  inferred_os?: string | null;
  query_rewritten?: boolean;
  [k: string]: unknown;
}

export interface ChatResponse {
  answer: string;
  intent?: string | null;
  safety_category?: string | null;
  layer_path?: string | null;
  rag_sources: RagSource[];
  stats: ChatStats;
  request_id?: string | null;
  estimated_cost?: number | null;
  verification_confidence?: number | null;
}

// ── /api/chat/stream (SSE) ───────────────────────────────────
export interface StreamMetadata {
  intent?: string | null;
  safety?: string | null;
  rag_used?: boolean;
  layer_path?: string | null;
}

// ── /rag/search ──────────────────────────────────────────────
export interface RagSearchRequest {
  query: string;
  top_k?: number;
}

export interface RagSearchResponse {
  query: string;
  top_k: number;
  results: RagSource[];
}

// ── /api/rules ───────────────────────────────────────────────
export interface CisRule {
  id: string;
  section?: string;
  category?: string;
  title: string;
  description?: string;
  level?: 1 | 2;
  auto_remediate?: boolean;
  manual_review?: boolean;
  sshd_directive?: string;
  expected_value?: string;
  kernel_module?: string;
  config_files?: string[];
  audit_command?: string;
  remediation_command?: string;
  audit_script?: string | null;
  remediation_script?: string | null;
  tags?: string[];
  cis_reference?: string;
}

export interface RuleListResponse {
  rules: CisRule[];
  total: number;
  offset: number;
  limit: number;
}

export interface RuleListParams {
  os_target?: OsTarget;
  level?: 1 | 2;
  category?: string;
  auto_remediate?: boolean;
  limit?: number;
  offset?: number;
}

// ── /api/rules/plan + /api/rules/conflicts ───────────────────
export interface RuleConflict {
  rule_a: string;
  rule_b: string;
  conflict_type: string; // "config_file" | "kernel_module"
  resource: string;
  description: string;
}

export interface ExecutionPlanResponse {
  ordered_rules: string[];
  conflicts: RuleConflict[];
  warnings: string[];
  rule_count: number;
}

// ── /api/artifacts/generate ──────────────────────────────────
export interface ArtifactRequest {
  rule_ids: string[];
  format: ArtifactFormat;
  os_target: string;
  security_level: SecurityLevel;
}

export interface ArtifactResponse {
  format: string;
  content: string;
  rule_count: number;
  os_target: string;
  warnings: string[];
}

// ── /health ──────────────────────────────────────────────────
export interface HealthResponse {
  status: string;
  service?: string;
  rag_available?: boolean;
  // /health/detailed adds component-level status
  components?: Record<string, string>;
  [k: string]: unknown;
}

// ── normalized API error ─────────────────────────────────────
export interface ApiErrorShape {
  status: number;
  code: string;
  message: string;
  requestId?: string;
  details?: Record<string, unknown>;
}
