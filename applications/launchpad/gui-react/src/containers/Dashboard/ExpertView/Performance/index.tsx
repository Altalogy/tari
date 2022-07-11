import { useEffect, useRef, useState, useMemo } from 'react'
import { listen } from '@tauri-apps/api/event'

import t from '../../../../locales'
import { selectNetwork } from '../../../../store/baseNode/selectors'
import { selectExpertView } from '../../../../store/app/selectors'
import { selectAllContainerEventsChannels } from '../../../../store/containers/selectors'
import { extractStatsFromEvent } from '../../../../store/containers/thunks'
import { StatsEventPayload } from '../../../../store/containers/types'
import { useAppSelector } from '../../../../store/hooks'
import getStatsRepository from '../../../../persistence/statsRepository'
import { Option } from '../../../../components/Select/types'

import PerformanceControls, {
  defaultRenderWindow,
  defaultRefreshRate,
} from './PerformanceControls'
import PerformanceChart from './PerformanceChart'
import { MinimalStatsEntry } from './types'

const CPU_GETTER = (se: MinimalStatsEntry) => se.cpu
const MEMORY_GETTER = (se: MinimalStatsEntry) => se.memory
const NETWORK_GETTER = (se: MinimalStatsEntry) =>
  (se.download || 0) / (1024 * 1024)

/**
 * @name PerformanceContainer
 * @description container component for performance statistics, renders filtering controls and performance charts
 * manages refresh rate and synchronizes refresh ticks for all charts
 * delegates chart rendering etc to other components
 *
 */
const PerformanceContainer = () => {
  const configuredNetwork = useAppSelector(selectNetwork)
  const expertView = useAppSelector(selectExpertView)
  const statsRepository = useMemo(getStatsRepository, [])
  const allContainerEventsChannels = useAppSelector(
    selectAllContainerEventsChannels,
  )
  const unsubscribeFunctions = useRef<(() => void)[]>()

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
  const counter = useRef(1)
  useEffect(() => {
    if (counter.current++ % 5 === 0) {
      const sinceS = new Date(since).getTime() / 1000
      setData(oldState => oldState.filter(d => d.timestampS > sinceS))
    }
  }, [since])

  useEffect(() => {
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

  const containerRef = useRef<HTMLDivElement | null>(null)
  const width = useMemo(() => {
    // collapse immediately after expertView value changes to 'open'
    // this way charts become smaller bfeore animation
    if (expertView === 'open') {
      return 532
    }

    const rect = containerRef.current?.getBoundingClientRect()
    return rect?.width || 532
  }, [containerRef.current, now, expertView])

  return (
    <div ref={containerRef}>
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
        title={t.common.nouns.cpu}
        getter={CPU_GETTER}
        width={width}
        percentage
      />

      <PerformanceChart
        since={since}
        now={now}
        data={data}
        title={t.expertView.performance.memoryChartTitle}
        getter={MEMORY_GETTER}
        width={width}
        unit={t.common.units.mib}
      />

      <PerformanceChart
        since={since}
        now={now}
        data={data}
        title={t.expertView.performance.networkChartTitle}
        getter={NETWORK_GETTER}
        width={width}
        unit={t.common.units.kbs}
      />
    </div>
  )
}

export default PerformanceContainer
