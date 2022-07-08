import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import groupby from 'lodash.groupby'
import { useTheme } from 'styled-components'
import { listen } from '@tauri-apps/api/event'

import uPlot from 'uplot'
import UplotReact from 'uplot-react'

import { selectNetwork } from '../../../../store/baseNode/selectors'
import { selectAllContainerEventsChannels } from '../../../../store/containers/selectors'
import { extractStatsFromEvent } from '../../../../store/containers/thunks'
import { StatsEventPayload } from '../../../../store/containers/types'
import { useAppSelector } from '../../../../store/hooks'
import getStatsRepository, {
  StatsEntry,
} from '../../../../persistence/statsRepository'
import t from '../../../../locales'
import { Option } from '../../../../components/Select/types'
import { Dictionary } from '../../../../types/general'

import PerformanceChart from './PerformanceChart'
import PerformanceControls, {
  defaultRenderWindow,
  defaultRefreshRate,
} from './PerformanceControls'
import guardBlanksWithNulls from './guardBlanksWithNulls'

const addDataWithBlankGuards = (
  oldEntries: StatsEntry[],
  stats: any,
  service: string,
  network: string,
  refreshRate: number,
): StatsEntry[] => {
  const hasOldTimeSeries = oldEntries.length

  const lastOldTimestamp = new Date(
    oldEntries[oldEntries.length - 1]?.timestamp,
  ).getTime()
  const firstNewTimestamp = new Date(stats.timestamp).getTime()
  const difference = hasOldTimeSeries ? firstNewTimestamp - lastOldTimestamp : 0
  const addStatsWithNullGuard = !hasOldTimeSeries || difference > refreshRate

  if (!addStatsWithNullGuard) {
    return [
      ...oldEntries,
      {
        ...stats,
        service,
        network,
      },
    ]
  }

  const nullGuardAtBlankStart = {
    timestamp: new Date(lastOldTimestamp + refreshRate).toISOString(),
    network,
    service,
    memory: null,
    cpu: null,
    download: null,
    upload: null,
  }

  const nullGuardAtBlankEnd = {
    timestamp: new Date(lastOldTimestamp + refreshRate).toISOString(),
    network,
    service,
    memory: null,
    cpu: null,
    download: null,
    upload: null,
  }

  return [
    ...oldEntries,
    nullGuardAtBlankStart,
    nullGuardAtBlankEnd,
    {
      ...stats,
      service,
      network,
    },
  ]
}

/**
 * @name PerformanceContainer
 * @description container component for performance statistics, renders filtering controls and performance charts
 * manages refresh rate and synchronizes refresh ticks for all charts
 * delegates chart rendering etc to other components
 *
 */
const PerformanceContainer = () => {
  const theme = useTheme()
  const configuredNetwork = useAppSelector(selectNetwork)
  const statsRepository = getStatsRepository()
  const allContainerEventsChannels = useAppSelector(
    selectAllContainerEventsChannels,
  )
  const unsubscribeFunctions = useRef<any[]>()

  const [timeWindow, setTimeWindow] = useState<Option>(defaultRenderWindow)
  const [refreshRate, setRefreshRate] = useState<Option>(defaultRefreshRate)
  const [now, setNow] = useState(() => {
    const n = new Date()
    n.setMilliseconds(0)

    return n
  })
  const since = useMemo(
    () => new Date(now.getTime() - Number(timeWindow.value)),
    [now],
  )
  const [data, setData] = useState<Dictionary<StatsEntry[]>>({})
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>()
  const [frozenCharts, setFrozenCharts] = useState<{
    cpu?: boolean
    memory?: boolean
    network?: boolean
  }>({})

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const n = new Date()
      n.setMilliseconds(0)
      setNow(n)
    }, Number(refreshRate.value))

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return () => clearInterval(intervalRef.current!)
  }, [refreshRate])

  const [xValues, setXValues] = useState<number[]>([])
  const [cpuData, setCpuData] = useState<Dictionary<number[]>>({})

  useEffect(() => {
    console.time('generateXValues')
    const xValues = []
    const nowS = now.getTime() / 1000
    const sinceS = since.getTime() / 1000
    console.debug({ nowS, sinceS })
    for (let i = 0; i < nowS - sinceS; ++i) {
      xValues.push(sinceS + i)
    }
    setXValues(xValues)
    console.timeEnd('generateXValues')
    console.debug('xvalueslength', xValues.length)
    console.debug({ xValues })

    // get data for the whole timeWindow whenever it changes
    // also set the `last` timestamp that is present in the dataset
    const getData = async () => {
      const data = await statsRepository.getGroupedByContainer(
        configuredNetwork,
        since,
      )

      console.time('generate series')
      const grouped = groupby(data.reverse(), 'service')
      const seriesData: Dictionary<number[]> = {}
      Object.keys(grouped).forEach(key => {
        const yValues = new Array(xValues.length).fill(null)
        grouped[key].forEach(v => {
          const idx = v.timestampS - sinceS
          yValues[idx] = v.cpu
        })
        seriesData[key] = yValues
      })
      console.timeEnd('generate series')
      console.debug({ seriesData })
      setCpuData(seriesData)
    }

    getData()
  }, [timeWindow])
  const colors = ['red', 'blue']

  return (
    <>
      <PerformanceControls
        refreshRate={refreshRate}
        onRefreshRateChange={option => setRefreshRate(option)}
        timeWindow={timeWindow}
        onTimeWindowChange={option => setTimeWindow(option)}
      />
      <button
        style={{ color: 'white' }}
        onClick={useCallback(
          () =>
            setFrozenCharts({
              cpu: true,
              memory: true,
              network: true,
            }),
          [now],
        )}
      >
        stop
      </button>
      <button style={{ color: 'white' }} onClick={() => setFrozenCharts({})}>
        start
      </button>

      <div style={{ color: 'white' }}>
        <UplotReact
          options={{
            title: 'cpu',
            width: 500,
            height: 175,
            series: [
              {},
              ...Object.keys(cpuData).map((cpuKey, id) => ({
                label: cpuKey,
                scale: '%',
                stroke: colors[id],
              })),
            ],
          }}
          data={[xValues, ...Object.values(cpuData)]}
          onCreate={_chart => null}
          onDelete={_chart => null}
        />
      </div>
    </>
  )
}

export default PerformanceContainer
