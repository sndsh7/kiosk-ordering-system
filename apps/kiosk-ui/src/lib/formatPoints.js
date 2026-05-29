/**
 * Formats a number in Indian number system (e.g. 100000 → 1,00,000)
 */
export function formatPoints(value) {
  if (value === null || value === undefined || isNaN(value)) return "0";
  return Number(value).toLocaleString("en-IN");
}
