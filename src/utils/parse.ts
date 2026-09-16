export function parseSpanishNumber(value: string | undefined | null): number | null {
  if (!value) return null
  const normalized = value.trim().replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : null
}