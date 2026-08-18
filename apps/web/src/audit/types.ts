import type { RegionId } from './regions';

export type Gender = 'M' | 'F';
export type ActivityKey = 'sedentary' | 'light' | 'moderate' | 'heavy' | 'veryHeavy';

export const DEPARTMENT_KEYS = ['it', 'hr', 'sales', 'marketing', 'finance', 'accounting', 'other'] as const;
export type DepartmentKey = (typeof DEPARTMENT_KEYS)[number];

export interface IntakeFormState {
  phone: string;
  email: string;
  region: RegionId | '';
  gender: Gender | '';
  age: string;
  activityKey: ActivityKey | '';
  height: string;
  weight: string;
  waist: string;
  hip: string;
  chest: string;
  neck: string;
  bicepsR: string;
  bicepsL: string;
  thighR: string;
  thighL: string;
  /** Только для корпоративной (анонимной) формы — см. IntakeForm mode="corporate". */
  department: DepartmentKey | '';
}

export const EMPTY_FORM: IntakeFormState = {
  phone: '',
  email: '',
  region: '',
  gender: '',
  age: '',
  activityKey: '',
  height: '',
  weight: '',
  waist: '',
  hip: '',
  chest: '',
  neck: '',
  bicepsR: '',
  bicepsL: '',
  thighR: '',
  thighL: '',
  department: '',
};

export interface GaugeZone {
  from: number;
  to: number;
  color: 'red' | 'amber' | 'green';
}

export interface GaugeSpec {
  domainMin: number;
  domainMax: number;
  zones: GaugeZone[];
  value: number | null;
}

export interface RawMeasurementResult {
  key: string;
  label: string;
  unit: string;
  value: number;
  genderPercentile: number | null;
  inwellPercentile: number | null;
  populationRange: { mean: number; sd: number } | null;
}

export interface MetricResult {
  key: string;
  label: string;
  unit: string;
  value: number | null;
  range: { min: number; max: number; text: string };
  score: number | null;
  band: { label: string; level: number };
  risk: { label: string; color: string };
  hasCategory: boolean;
  gauge: GaugeSpec;
  description: string;
  shortDescription: string;
  genderPercentile: number | null;
  inwellPercentile: number | null;
}

export interface BodyFatResult {
  label: string;
  value: number;
  unit: string;
  category: string;
  categoryLabel: string;
  referencePercentile: number | null;
  inwellPercentile: number | null;
  description: string;
  shortDescription: string;
}

export interface BsaResult {
  value: number;
  unit: string;
  description: string;
  shortDescription: string;
}

export interface EnergyValue {
  value: number;
  unit: string;
  description: string;
}

export interface EnergyResult {
  bmr: EnergyValue;
  tdee: EnergyValue;
}

export interface ProgressMetric {
  previous: number;
  current: number;
  delta: number;
  direction: 'up' | 'down' | 'flat';
  isPercentagePoints?: boolean;
}

export interface SymmetryPairResult {
  key: 'thigh' | 'biceps';
  unit: string;
  right: number;
  left: number;
  diffAbs: number;
  diffPct: number;
  symmetryScore: number;
  largerSide: 'right' | 'left' | 'equal';
  referenceSymmetryPercentile: number | null;
  inwellSymmetryPercentile: number | null;
  progress: ProgressMetric | null;
}

export interface SymmetryResult {
  thigh: SymmetryPairResult;
  biceps: SymmetryPairResult;
}

export interface ActivityProgress {
  previous: string;
  current: string;
  changed: boolean;
}

export interface ProgressResult {
  isFirst: boolean;
  previousDate: string | null;
  raw: Record<string, ProgressMetric | null>;
  metrics: Record<string, ProgressMetric | null>;
  bodyFat: ProgressMetric | null;
  bsa: ProgressMetric | null;
  bmr: ProgressMetric | null;
  tdee: ProgressMetric | null;
  activity: ActivityProgress | null;
}

export interface FullReport {
  measuredAt: string;
  age: number;
  gender: Gender;
  activityKey: ActivityKey;
  inwellScore: number;
  inwellScoreBand: { label: string; level: number };
  inwellScorePercentile: number | null;
  inwellScoreGauge: GaugeSpec;
  conclusion: string;
  referenceAgeLabel: string;
  rawMeasurements: RawMeasurementResult[];
  metrics: MetricResult[];
  bodyFat: BodyFatResult;
  bsa: BsaResult;
  energy: EnergyResult;
  symmetry: SymmetryResult;
  progress: ProgressResult;
  importantInfo: string[];
  confidentiality: string[];
}
