export function fullName(value) {
  const name = String(value || '').trim().replace(/\s+/gu, ' ');
  const parts = name.split(' ');
  return name.length <= 100 && parts.length >= 2 && parts.length <= 3 &&
    parts.every((part) => /^[\p{L}][\p{L}\p{M}'’\-]{1,39}$/u.test(part)) ? name : null;
}
