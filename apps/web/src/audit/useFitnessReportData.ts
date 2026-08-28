import { useMemo } from 'react';
import { fmt, formatDate } from './reportFormat';
import type { FullReport, RawMeasurementResult } from './types';
import type { Content } from '../i18n/ru';

/**
 * Data-derivation hook extracted from ReportView.tsx (see the code review,
 * section 6: that component was mixing data shaping -- computing
 * DATA_FIELDS, orderedRaw, progress entries -- with a ~800-line render
 * tree). This hook owns exactly the derivation half: given a fitness
 * FullReport, it returns the shaped/filtered/ordered data ReportView's JSX
 * reads directly, independent of any rendering concerns. Fitness-only (the
 * 5 questionnaire test types go through GenericReportView, not this).
 *
 * `report` accepts `null` specifically so ReportView.tsx can call this hook
 * UNCONDITIONALLY, before its early-return to GenericReportView for
 * questionnaire test types -- calling a hook only on some renders (i.e.
 * after a conditional early return) breaks React's Rules of Hooks. Pass
 * `null` on the questionnaire path; the (unused) result is a shape-matched
 * but empty object.
 */
export function useFitnessReportData(
  report: FullReport | null,
  opts: { activityLabel: string; lang: string; r: Content['audit']['report'] },
) {
  const { activityLabel, lang, r } = opts;

  return useMemo(() => {
    if (!report) {
      return {
        date: '',
        ageLabel: '',
        rawByKey: (_key: string) => undefined as RawMeasurementResult | undefined,
        bodyCompositionMetrics: [] as FullReport['metrics'],
        shapeIndexMetrics: [] as FullReport['metrics'],
        DATA_FIELDS: [] as { key: string; label: string; value: string; unit?: string }[],
        RAW_ORDER: [] as string[],
        orderedRaw: [] as RawMeasurementResult[],
        rawProgressEntries: [] as { key: string; rm: RawMeasurementResult | undefined; metric: unknown }[],
        METRIC_ORDER: [] as string[],
        metricProgressEntries: [] as { key: string; m: FullReport['metrics'][number] | undefined; metric: unknown }[],
        hasAnyProgress: false,
        weightProgress: undefined,
        waistProgress: undefined,
        bmiProgress: undefined,
        bodyFatProgress: undefined,
        weightRm: undefined as RawMeasurementResult | undefined,
        waistRm: undefined as RawMeasurementResult | undefined,
        bmiMetric: undefined as FullReport['metrics'][number] | undefined,
      };
    }

    const date = formatDate(report.measuredAt);
    const ageLabel = report.referenceAgeLabel;
    const rawByKey = (key: string) => report.rawMeasurements.find((m) => m.key === key);

    const bodyCompositionKeys = ['bmi', 'whtr', 'whr'];
    const bodyCompositionMetrics = report.metrics.filter((m) => bodyCompositionKeys.includes(m.key));
    const shapeIndexMetrics = report.metrics.filter((m) => !bodyCompositionKeys.includes(m.key));

    const DATA_FIELDS: { key: string; label: string; value: string; unit?: string }[] = [
      { key: 'gender', label: r.snapshotGender, value: report.gender === 'M' ? r.genderMale : r.genderFemale },
      { key: 'age', label: r.snapshotAge, value: String(report.age), unit: r.snapshotAgeUnit },
      ...['height', 'weight', 'waist', 'hip', 'chest', 'neck', 'bicepsR', 'bicepsL', 'thighR', 'thighL']
        .map((key) => rawByKey(key))
        .filter((rm): rm is RawMeasurementResult => !!rm)
        .map((rm) => ({ key: rm.key, label: rm.label, value: fmt(rm.value, 1, lang), unit: rm.unit })),
      { key: 'activity', label: r.snapshotActivity, value: activityLabel },
    ];

    const RAW_ORDER = ['height', 'weight', 'waist', 'hip', 'chest', 'neck', 'bicepsR', 'bicepsL', 'thighR', 'thighL'];
    const orderedRaw = RAW_ORDER.map((key) => rawByKey(key)).filter((rm): rm is RawMeasurementResult => !!rm);

    const rawProgressEntries = RAW_ORDER.map((key) => ({ key, rm: rawByKey(key), metric: report.progress.raw[key] })).filter((e) => e.rm && e.metric);
    const METRIC_ORDER = ['bmi', 'whtr', 'whr', 'bai', 'bri', 'absi', 'avi', 'ci', 'vat'];
    const metricProgressEntries = METRIC_ORDER.map((key) => ({
      key,
      m: report.metrics.find((mm) => mm.key === key),
      metric: report.progress.metrics[key],
    })).filter((e) => e.m && e.metric);

    const hasAnyProgress =
      !report.progress.isFirst &&
      (rawProgressEntries.length > 0 ||
        metricProgressEntries.length > 0 ||
        report.progress.bodyFat ||
        report.progress.bsa ||
        report.progress.bmr ||
        report.progress.tdee ||
        report.symmetry.thigh.progress ||
        report.symmetry.biceps.progress ||
        report.progress.activity);

    const weightProgress = report.progress.raw['weight'];
    const waistProgress = report.progress.raw['waist'];
    const bmiProgress = report.progress.metrics['bmi'];
    const bodyFatProgress = report.progress.bodyFat;
    const weightRm = rawByKey('weight');
    const waistRm = rawByKey('waist');
    const bmiMetric = report.metrics.find((m) => m.key === 'bmi');

    return {
      date,
      ageLabel,
      rawByKey,
      bodyCompositionMetrics,
      shapeIndexMetrics,
      DATA_FIELDS,
      RAW_ORDER,
      orderedRaw,
      rawProgressEntries,
      METRIC_ORDER,
      metricProgressEntries,
      hasAnyProgress: Boolean(hasAnyProgress),
      weightProgress,
      waistProgress,
      bmiProgress,
      bodyFatProgress,
      weightRm,
      waistRm,
      bmiMetric,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report, activityLabel, lang, r]);
}
