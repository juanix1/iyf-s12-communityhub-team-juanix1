export const SUGGESTED_ROUTES = [
  'Thika Road',
  'Mombasa Road',
  'Ngong Road',
  'Waiyaki Way',
  'Kiambu Road',
  'Jogoo Road',
  'Eastern Bypass',
  'Other',
];

export const TRAFFIC_STATUSES = [
  {
    value: 'Smooth',
    label: 'Smooth',
    description: 'Moving freely with minimal stage queues',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  {
    value: 'Slow',
    label: 'Slow',
    description: 'Moderate congestion or building queues',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  {
    value: 'Gridlock',
    label: 'Gridlock',
    description: 'Heavy standstill traffic or major delays',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-600',
  },
];

export const REPORT_REASONS = [
  'False or misleading fare/traffic info',
  'Spam or advertising',
  'Harassment or abusive language',
  'Unsafe or dangerous advice',
  'Other',
];
