export function formatDZD(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  const num = Number(value);
  if (num === 0) return 'Sur devis';
  return `${new Intl.NumberFormat('fr-DZ').format(num)} DZD`;
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
