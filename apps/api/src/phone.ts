/**
 * Узбекский номер телефона в строгом формате +998 XX XXX XX XX.
 * normalizePhone принимает то, что реально придёт с фронтенда (маска ввода
 * уже должна была привести его почти к этому виду, но бэкенд не доверяет
 * фронтенду и перепроверяет сам) и возвращает нормализованный вид
 * +998XXXXXXXXX, который используется как уникальный ключ пользователя.
 */

const DIGITS_AFTER_CODE = 9; // XX XXX XX XX = 9 цифр

export function normalizePhone(raw: string): string | null {
  if (!raw) return null;
  const digitsOnly = raw.replace(/\D/g, '');
  // Принимаем и "998901234567", и "901234567" (без кода страны — допишем).
  let national: string;
  if (digitsOnly.startsWith('998') && digitsOnly.length === 12) {
    national = digitsOnly.slice(3);
  } else if (digitsOnly.length === DIGITS_AFTER_CODE) {
    national = digitsOnly;
  } else {
    return null;
  }
  if (national.length !== DIGITS_AFTER_CODE) return null;
  return `+998${national}`;
}

export function formatPhoneDisplay(normalized: string): string {
  // +998XXXXXXXXX -> +998 XX XXX XX XX
  const m = normalized.match(/^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/);
  if (!m) return normalized;
  return `+998 ${m[1]} ${m[2]} ${m[3]} ${m[4]}`;
}

export function isValidPhone(raw: string): boolean {
  return normalizePhone(raw) !== null;
}
