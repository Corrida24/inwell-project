export type AuditStatus = 'active' | 'full' | 'expired';

/** 5 новых тестов + существующий фитнес-аудит. Держится в синхроне с
 * apps/api/src/calc/questionnaire/types.ts (TEST_TYPES) — на фронте нет
 * общего пакета с бэкендом, поэтому это ручной, но маленький дубликат. */
export const TEST_TYPES = ['fitness', 'loyalty', 'burnout', 'turnover', 'wellbeing', 'psychSafety'] as const;
export type TestType = (typeof TEST_TYPES)[number];

export interface Company {
  id: string;
  name: string;
  inn: string;
}

export interface AuditListItem {
  id: string;
  name: string;
  testType: TestType;
  deadline: string;
  maxResponses: number;
  comment: string | null;
  publicToken: string;
  responseCount: number;
  status: AuditStatus;
  createdAt: string;
}

export interface CreateAuditInput {
  name: string;
  testType: TestType;
  deadline: string;
  maxResponses: number;
  comment?: string;
}

export interface MetricAggregate {
  key: string;
  label: string;
  unit: string;
  hasCategory: boolean;
  average: number | null;
  distribution: { label: string; pct: number; level: number }[] | null;
}

export interface GroupAggregate {
  key: string;
  label: string;
  participantCount: number;
  averageScore: number | null;
  metrics: MetricAggregate[];
}

export interface CompositionBreakdown {
  key: string;
  label: string;
  count: number;
  pct: number;
}

export interface Composition {
  gender: CompositionBreakdown[];
  ageBand: CompositionBreakdown[];
  department: CompositionBreakdown[];
  region: CompositionBreakdown[];
}

export interface Highlight {
  key: string;
  label: string;
  pct: number;
}

export interface AvailableFilters {
  departments: string[];
  genders: ('M' | 'F')[];
  regions: string[];
  ageBands: { id: string; label: string }[];
  offices: string[];
}

export interface AuditAggregation {
  participantCount: number;
  availableFilters: AvailableFilters;
  appliedFilters: { department?: string; gender?: 'M' | 'F'; region?: string; ageBand?: string; office?: string };
  headlineLabel: string;
  overall: GroupAggregate;
  composition: Composition;
  positiveHighlights: Highlight[];
  attentionHighlights: Highlight[];
  byDepartment: GroupAggregate[];
  byGender: GroupAggregate[];
  byAgeBand: GroupAggregate[];
}

/** Пока ответов меньше MIN_RESPONSES_PER_AUDIT (15) — бэкенд не считает
 * агрегацию вовсе (см. routes/corporate.ts), а просто говорит "сколько ещё
 * не хватает". */
export interface InsufficientDataResponse {
  audit: AuditListItem;
  insufficientData: true;
  responseCount: number;
  minRequired: number;
}

export interface AuditResultsWithAggregation {
  audit: AuditListItem;
  aggregation: AuditAggregation;
  insufficientData?: undefined;
}

export type AuditResultsResponse = AuditResultsWithAggregation | InsufficientDataResponse;
