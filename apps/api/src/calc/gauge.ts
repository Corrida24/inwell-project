/**
 * Порт buildZoneGaugeSVG() из fitaudit/js/report.js — считает зоны для
 * "спидометра" (красная/жёлтая/зелёная/жёлтая/красная для gaugeType
 * 'range' — что и просил заказчик; плюс варианты higherBetter/lowerBetter
 * для полноты, хотя в текущем наборе из 9 показателей используется только
 * 'range'). Возвращает чистые данные — рисует SVG уже фронтенд.
 */
import type { GaugeType } from './metricsRegistry.js';

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

export function buildGaugeSpec(value: number | null, goodMin: number, goodMax: number, gaugeType: GaugeType): GaugeSpec {
  const span = Math.max(goodMax - goodMin || 0, 0.0001);
  let domainMin: number, domainMax: number, zones: GaugeZone[];

  if (gaugeType === 'higherBetter') {
    domainMin = 0;
    domainMax = Math.max(goodMin * 1.7, goodMin + 1);
    zones = [
      { from: 0, to: goodMin * 0.72, color: 'red' },
      { from: goodMin * 0.72, to: goodMin, color: 'amber' },
      { from: goodMin, to: domainMax, color: 'green' },
    ];
  } else if (gaugeType === 'lowerBetter') {
    domainMin = 0;
    domainMax = Math.max(goodMax * 1.6, goodMax + 10);
    zones = [
      { from: 0, to: goodMax, color: 'green' },
      { from: goodMax, to: goodMax * 1.22, color: 'amber' },
      { from: goodMax * 1.22, to: domainMax, color: 'red' },
    ];
  } else {
    domainMin = Math.max(0, goodMin - span * 1.3);
    domainMax = goodMax + span * 1.3;
    zones = [
      { from: domainMin, to: goodMin - span * 0.3, color: 'red' },
      { from: goodMin - span * 0.3, to: goodMin, color: 'amber' },
      { from: goodMin, to: goodMax, color: 'green' },
      { from: goodMax, to: goodMax + span * 0.3, color: 'amber' },
      { from: goodMax + span * 0.3, to: domainMax, color: 'red' },
    ];
  }

  return { domainMin, domainMax, zones, value };
}
