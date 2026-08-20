import { supabase } from './supabaseClient';
import type { AuditListItem, Company, CreateAuditInput, AuditResultsResponse } from './types';

// См. пояснение в audit/api.ts — "" осознанно значит "тот же origin",
// поэтому "??", а не "||".
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

export class CorporateApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string[]>;
  constructor(status: number, code: string | undefined, message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

async function authHeader(): Promise<Record<string, string>> {
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = { 'Content-Type': 'application/json', ...(await authHeader()), ...(init?.headers || {}) };
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new CorporateApiError(res.status, body.error, body.error || 'request_failed', body.details?.fieldErrors);
  }
  return res.json();
}

export function getMyCompany(): Promise<Company> {
  return request<Company>('/api/corporate/me');
}

export function listAudits(): Promise<{ audits: AuditListItem[] }> {
  return request('/api/corporate/audits');
}

export function createAudit(input: CreateAuditInput): Promise<{ audit: AuditListItem }> {
  return request('/api/corporate/audits', { method: 'POST', body: JSON.stringify(input) });
}

export function getAuditResults(
  auditId: string,
  filters: { department?: string; gender?: string; region?: string; ageBand?: string; office?: string },
  lang: string,
): Promise<AuditResultsResponse> {
  const params = new URLSearchParams();
  if (filters.department) params.set('department', filters.department);
  if (filters.gender) params.set('gender', filters.gender);
  if (filters.region) params.set('region', filters.region);
  if (filters.ageBand) params.set('ageBand', filters.ageBand);
  if (filters.office) params.set('office', filters.office);
  params.set('lang', lang);
  return request(`/api/corporate/audits/${auditId}/results?${params.toString()}`);
}
