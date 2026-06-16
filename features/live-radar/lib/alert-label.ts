/** "1 alert" vs "2 alerts" for KPI badges */
export function alertCountLabel(count: number): string {
  return `${count} alert${count === 1 ? "" : "s"}`;
}
