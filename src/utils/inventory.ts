export function getAvailableQuantity(availabilityStatus: string): number | undefined {
  if (availabilityStatus === 'Out Of Stock') return 0;
  const count = availabilityStatus.match(/^Only\s+(\d+)/i)?.[1];
  return count === undefined ? undefined : Number(count);
}

export function exceedsAvailableQuantity(availabilityStatus: string, quantity: number): boolean {
  const available = getAvailableQuantity(availabilityStatus);
  return available !== undefined && quantity > available;
}
