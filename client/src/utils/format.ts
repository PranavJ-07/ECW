export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(date);
}

export function formatRelativeDay(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;

  return formatDate(date);
}

export function isUpcoming(value: string | Date): boolean {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.getTime() >= Date.now();
}
