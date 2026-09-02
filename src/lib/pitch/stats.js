// Small, framework-free numeric helpers shared by the pitch engine and the
// note tracker. Kept in one place so the median is defined exactly once —
// previously the two median windows were subtly-different inline copies.

/**
 * Median of a numeric array. For even-length input the two middle values are
 * averaged, so the result stays centered regardless of window parity.
 */
export function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ?
      sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2
}
