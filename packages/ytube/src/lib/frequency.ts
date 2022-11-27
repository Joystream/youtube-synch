export const allFrequencies = [0, 1, 10, 30, 60, 120, 180, 240, 360, 720, 1440] as const
export type Frequency = typeof allFrequencies[number]

export function getMatchingFrequenciesForDate(date: Date): Frequency[] {
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const totalMinutes = 60 * hours + minutes
  return allFrequencies.filter((f) => totalMinutes % f === 0)
}

export function getMatchingFrequencies(frequency: Frequency) {
  return allFrequencies.filter((f) => frequency % f === 0)
}
