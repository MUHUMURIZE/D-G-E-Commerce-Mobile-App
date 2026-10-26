export function formatRwf(amount: number): string {
  return `${Math.round(amount).toLocaleString('en-RW')} RWF`;
}
