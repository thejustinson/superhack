export type CohortStatus = 'upcoming' | 'active' | 'past'

export interface CountdownResult {
  status: CohortStatus
  days: number
  hours: number
  minutes: number
  seconds: number
  label: string // e.g. "Starts in" or "Ends in"
}

export function getCountdown(startDate: string, endDate: string): CountdownResult {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  let target: Date
  let label: string
  let status: CohortStatus

  if (now < start) {
    target = start
    label = 'Starts in'
    status = 'upcoming'
  } else if (now >= start && now < end) {
    target = end
    label = 'Ends in'
    status = 'active'
  } else {
    return { status: 'past', days: 0, hours: 0, minutes: 0, seconds: 0, label: 'Ended' }
  }

  const diff = target.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { status, days, hours, minutes, seconds, label }
}
