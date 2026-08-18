import React from 'react';
import type { GaugeSpec } from './types';

const COLOR: Record<string, string> = { red: '#ef4444', amber: '#f59e0b', green: '#10b981' };

/**
 * Порт buildZoneGaugeSVG() из оригинального Fit Audit report.js — та самая
 * шкала "красная/жёлтая/зелёная/жёлтая/красная" с маркером текущего
 * значения, которую заказчик описал как "спидометр".
 */
export const ZoneGauge: React.FC<{ gauge: GaugeSpec; height?: number }> = ({ gauge, height = 30 }) => {
  const W = 320;
  const barY = 12;
  const barH = 14;
  const H = barY + barH + 4;

  const scaleX = (v: number) => {
    const c = Math.max(gauge.domainMin, Math.min(gauge.domainMax, v));
    return ((c - gauge.domainMin) / (gauge.domainMax - gauge.domainMin)) * W;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={height} style={{ display: 'block' }}>
      <rect x={0} y={barY} width={W} height={barH} rx={4} fill="#e2e8f0" />
      {gauge.zones.map((z, i) => {
        const x1 = scaleX(z.from);
        const x2 = scaleX(z.to);
        if (x2 <= x1) return null;
        return <rect key={i} x={x1} y={barY} width={x2 - x1} height={barH} fill={COLOR[z.color]} opacity={0.85} />;
      })}
      {gauge.value !== null && !Number.isNaN(gauge.value) && (
        <>
          <polygon
            points={`${scaleX(gauge.value) - 6},${barY - 8} ${scaleX(gauge.value) + 6},${barY - 8} ${scaleX(gauge.value)},${barY - 1}`}
            fill="#0f172a"
          />
          <rect x={scaleX(gauge.value) - 1.5} y={barY} width={3} height={barH} fill="#0f172a" />
        </>
      )}
    </svg>
  );
};
