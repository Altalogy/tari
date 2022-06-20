import BigNumber from 'bignumber.js'

export const dateTime = (d: Date): string =>
  `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`

export const localHour = (d: Date): string =>
  d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

export const utcHour = ({
  hours,
  minutes,
}: {
  hours: number
  minutes: number
}) => {
  const date = new Date()
  date.setUTCHours(hours)
  date.setUTCMinutes(minutes)

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export const day = (date: Date) =>
  date.toLocaleDateString([], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

export const month = (date: Date) =>
  date.toLocaleDateString([], { year: 'numeric', month: 'long' })

export const shortMonth = (date: Date) =>
  date.toLocaleDateString([], { year: 'numeric', month: 'short' })

/**
 * Convert milliseconds to 0:00:00 {hours:minutes:seconds} format.
 * @param {number} time - milliseconds
 *
 * @example
 * humanizeTime(10000000) // '02:46:40'
 */
export const humanizeTime = (time: number): string => {
  const hours = Math.trunc(time / 3600000).toString()
  const minutes = (Math.trunc(time / 60000) % 60).toString()
  const seconds = (Math.trunc(time / 1000) % 60).toString()

  return `${hours.padStart(1, '0')}:${minutes.padStart(
    2,
    '0',
  )}:${seconds.padStart(2, '0')}`
}

/**
 * Convert Tauri to micro Tauri (uT) value
 * @param {string} amount amount in Tari
 * @returns {string}
 */
export const toMicroT = (amount: string): string => {
  return new BigNumber(amount).multipliedBy(1000000).toString()
}

/**
 * Convert micro Tauri to Tauri value
 * @param {string} amount amount in micro Tari (uT)
 * @returns {string}
 */
export const toT = (amount: string): string => {
  return new BigNumber(amount).dividedBy(1000000).toString()
}
