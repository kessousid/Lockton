export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    filed: 'bg-blue-100 text-blue-800',
    under_review: 'bg-orange-100 text-orange-800',
    approved: 'bg-green-100 text-green-800',
    denied: 'bg-red-100 text-red-800',
    paid: 'bg-emerald-100 text-emerald-800',
    closed: 'bg-gray-100 text-gray-800',
    upcoming: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    quoted: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
    critical: 'bg-red-200 text-red-900',
    none: 'bg-gray-100 text-gray-600',
    error: 'bg-red-100 text-red-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
}

export function policyTypeLabel(type: string): string {
  const map: Record<string, string> = {
    general_liability: 'General Liability',
    property: 'Property',
    workers_comp: 'Workers Comp',
    auto: 'Auto',
    umbrella: 'Umbrella',
    cyber: 'Cyber',
    professional_liability: 'Professional Liability',
    health: 'Health',
  };
  return map[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
