// Small local-time date helpers. Deliberately simple for the MVP —
// no timezone/library complexity yet.

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export function isToday(date) {
  const d = new Date(date);
  return d >= startOfToday() && d <= endOfToday();
}

export function isOverdue(date) {
  return new Date(date) < startOfToday();
}

export function isUpcoming(date) {
  return new Date(date) > endOfToday();
}

export function formatDeadline(date) {
  if (!date) return null;
  const d = new Date(date);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  });
}

export function formatClock(date) {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatFullDate(date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}