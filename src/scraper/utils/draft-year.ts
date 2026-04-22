export function getDraftYear(now?: Date): number {
  const date = now ?? new Date();
  return date.getFullYear();
}
