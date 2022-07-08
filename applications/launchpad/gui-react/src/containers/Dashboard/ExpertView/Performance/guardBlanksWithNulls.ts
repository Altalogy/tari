import { SeriesData } from '../../../../components/Charts/TimeSeries/types'
import { StatsEntry } from '../../../../persistence/statsRepository'

// TODO this is a performance nightmare
const guardBlanksWithNulls = (
  data: StatsEntry[],
  interval = 1000,
): StatsEntry[] => {
  console.time('guard')
  if (!data.length) {
    return data
  }

  const nullsToInsert: {
    index: number
    timestamp: number
    network: string
    service: string
  }[] = []

  for (let i = 1; i < data.length; ++i) {
    const aData = data[i - 1]
    const a = new Date(aData.timestamp).getTime()
    const bData = data[i]
    const b = new Date(bData.timestamp).getTime()

    if (b - a > interval) {
      nullsToInsert.push({
        index: i,
        timestamp: a + interval,
        network: aData.network,
        service: aData.service,
      })
      nullsToInsert.push({
        index: i,
        timestamp: b - interval,
        network: aData.network,
        service: aData.service,
      })
    }
  }

  if (!nullsToInsert.length) {
    return data
  }

  const dataCopy = [...data]
  nullsToInsert.forEach((nullToInsert, i) => {
    dataCopy.splice(nullToInsert.index + i, 0, {
      timestamp: new Date(nullToInsert.timestamp).toISOString(),
      timestampS: nullToInsert.timestamp / 1000,
      cpu: null,
      memory: null,
      download: null,
      upload: null,
      network: nullToInsert.network,
      service: nullToInsert.service,
    })
  })

  console.timeEnd('guard')
  return dataCopy
}

export default guardBlanksWithNulls
