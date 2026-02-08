export const chips = [
  { value: 25, count: 8, fill: '#dc2626' },
  { value: 50, count: 8, fill: '#2563eb' },
  { value: 100, count: 5, fill: '#1a1a2e' },
  { value: 500, count: 3, fill: '#16a34a' },
] as const;

export const STARTING_STACK_TOTAL = chips.reduce((sum, c) => sum + c.value * c.count, 0);
