import React from 'react';

interface PhoneInputProps {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  className?: string;
}

/** Formats keystrokes into the strict +998 XX XXX XX XX shape as the user types. */
function formatAsTyped(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('998')) digits = digits.slice(3);
  digits = digits.slice(0, 9);

  let out = '+998';
  if (digits.length > 0) out += ' ' + digits.slice(0, 2);
  if (digits.length > 2) out += ' ' + digits.slice(2, 5);
  if (digits.length > 5) out += ' ' + digits.slice(5, 7);
  if (digits.length > 7) out += ' ' + digits.slice(7, 9);
  return out;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, error, className = '' }) => {
  return (
    <input
      type="tel"
      inputMode="numeric"
      placeholder="+998 90 123 45 67"
      value={value}
      onChange={(e) => onChange(formatAsTyped(e.target.value))}
      onFocus={(e) => {
        if (!e.target.value) onChange('+998 ');
      }}
      className={`w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg border bg-white text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/40 transition-colors ${
        error ? 'border-rose-400' : 'border-sky-200 focus:border-brand-teal'
      } ${className}`}
    />
  );
};
