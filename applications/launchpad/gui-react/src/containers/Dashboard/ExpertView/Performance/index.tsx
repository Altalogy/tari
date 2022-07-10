import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import groupby from 'lodash.groupby'
import { listen } from '@tauri-apps/api/event'

import uPlot from 'uplot'
import UplotReact from 'uplot-react'

import colors from '../../../../styles/styles/colors'
import { selectNetwork } from '../../../../store/baseNode/selectors'
import { selectAllContainerEventsChannels } from '../../../../store/containers/selectors'
import { extractStatsFromEvent } from '../../../../store/containers/thunks'
import { StatsEventPayload } from '../../../../store/containers/types'
import { useAppSelector } from '../../../../store/hooks'
import getStatsRepository from '../../../../persistence/statsRepository'
import { Option } from '../../../../components/Select/types'
import { Dictionary } from '../../../../types/general'

import PerformanceControls, {
  defaultRenderWindow,
  defaultRefreshRate,
} from './PerformanceControls'

type MinimalStatsEntry = {
  cpu: number | null
  memory: number | null
  download: number | null
  service: string
  timestampS: number
}

const chartColors = [
  colors.secondary.infoText,
  colors.secondary.onTextLight,
  colors.secondary.warningDark,
  colors.graph.fuchsia,
  colors.secondary.warning,
  colors.tari.purple,
  colors.graph.yellow,
  colors.graph.lightGreen,
]

const PerformanceChart = ({
  since,
  now,
  data,
  getter,
  title,
}: {
  since: Date
  now: Date
  data: MinimalStatsEntry[]
  getter: (se: MinimalStatsEntry) => number | null
  title: string
}) => {
  const [latchedSinceS, setLatchedSinceS] = useState(since.getTime() / 1000)
  const [latchedNowS, setLatchedNowS] = useState(now.getTime() / 1000)
  const [frozen, setFrozen] = useState(false)

  useEffect(() => {
    if (frozen) {
      return
    }

    setLatchedSinceS(since.getTime() / 1000)
  }, [frozen, since])

  useEffect(() => {
    if (frozen) {
      return
    }

    setLatchedNowS(now.getTime() / 1000)
  }, [frozen, now])

  const xValues = useMemo(() => {
    const x = []
    for (let i = 0; i < latchedNowS - latchedSinceS; ++i) {
      x.push(latchedSinceS + i)
    }

    return x
  }, [latchedNowS, latchedSinceS])
  const chartData = useMemo(() => {
    const grouped = groupby(data, 'service')
    const seriesData: Dictionary<number[]> = {}
    const sinceS = xValues[0]
    Object.keys(grouped)
      .sort()
      .forEach(key => {
        const yValues = new Array(xValues.length).fill(null)
        grouped[key].forEach(v => {
          const idx = v.timestampS - sinceS
          if (idx < yValues.length) {
            yValues[idx] = getter(v)
          }
        })
        seriesData[key] = yValues
      })
    return seriesData
  }, [xValues, getter])

  const mouseLeave = useCallback(
    (_e: MouseEvent) => {
      setFrozen(false)

      return null
    },
    [since, now],
  )
  const mouseEnter = useCallback(
    (_e: MouseEvent) => {
      setFrozen(true)

      return null
    },
    [since, now],
  )

  const options = useMemo(
    () => ({
      title,
      width: 500,
      height: 175,
      cursor: {
        bind: {
          mouseenter: () => mouseEnter,
          mouseleave: () => mouseLeave,
        },
      },
      scales: {
        '%': {
          auto: false,
          range: [0, 100] as [number, number],
        },
      },
      series: [
        {},
        ...Object.keys(chartData).map((key, id) => ({
          label: key,
          scale: '%',
          stroke: chartColors[id],
        })),
      ],
    }),
    [title, mouseEnter, mouseLeave, chartData],
  )

  return (
    <div style={{ color: 'white' }}>
      <UplotReact
        options={options}
        data={[xValues, ...Object.values(chartData)]}
        onCreate={_chart => null}
        onDelete={_chart => null}
      />
    </div>
  )
}

/**
 * @name PerformanceContainer
 * @description container component for performance statistics, renders filtering controls and performance charts
 * manages refresh rate and synchronizes refresh ticks for all charts
 * delegates chart rendering etc to other components
 *
 */
const cpuGetter = (se: MinimalStatsEntry) => se.cpu
const memoryGetter = (se: MinimalStatsEntry) => se.memory
const networkGetter = (se: MinimalStatsEntry) => se.download
const PerformanceContainer = () => {
  const configuredNetwork = useAppSelector(selectNetwork)
  const statsRepository = useMemo(getStatsRepository, [])
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>()

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const n = new Date()
      n.setMilliseconds(0)
      setNow(n)
    }, Number(refreshRate.value))

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return () => clearInterval(intervalRef.current!)
  }, [refreshRate])

  const [data, setData] = useState<MinimalStatsEntry[]>([])

  useEffect(() => {
    // get data for the whole timeWindow whenever it changes
    // also set the `last` timestamp that is present in the dataset
    const getData = async () => {
      const data = await statsRepository.getGroupedByContainer(
        configuredNetwork,
        since,
      )

      setData(
        data.map(statsEntry => ({
          cpu: statsEntry.cpu,
          memory: statsEntry.memory,
          download: statsEntry.download,
          timestampS: new Date(statsEntry.timestamp).getTime() / 1000,
          service: statsEntry.service,
        })),
      )
    }

    getData()
  }, [timeWindow])

  useEffect(() => {
    const subscribeToAllChannels = async () => {
      unsubscribeFunctions.current = await Promise.all(
        allContainerEventsChannels.map(containerChannel =>
          listen(
            containerChannel.eventsChannel as string,
            (statsEvent: { payload: StatsEventPayload }) => {
              const stats = extractStatsFromEvent(statsEvent.payload)

              const statsEntry = {
                cpu: stats.cpu,
                memory: stats.memory,
                upload: stats.network.upload,
                download: stats.network.download,
                timestampS: new Date(stats.timestamp).getTime() / 1000,
                service: containerChannel.service as string,
              }

              setData(oldData => [...oldData, statsEntry])
            },
          ),
        ),
      )
    }

    subscribeToAllChannels()

    return () =>
      unsubscribeFunctions.current &&
      unsubscribeFunctions.current.forEach(unsubscribe => unsubscribe())
  }, [allContainerEventsChannels, configuredNetwork])

  return (
    <>
      <PerformanceControls
        refreshRate={refreshRate}
        onRefreshRateChange={option => setRefreshRate(option)}
        timeWindow={timeWindow}
        onTimeWindowChange={option => setTimeWindow(option)}
      />

      <PerformanceChart
        since={since}
        now={now}
        data={data}
        title='cpu'
        getter={cpuGetter}
      />

      <PerformanceChart
        since={since}
        now={now}
        data={data}
        title='memory'
        getter={memoryGetter}
      />

      <PerformanceChart
        since={since}
        now={now}
        data={data}
        title='network download'
        getter={networkGetter}
      />
    </>
  )
}

export default PerformanceContainer
