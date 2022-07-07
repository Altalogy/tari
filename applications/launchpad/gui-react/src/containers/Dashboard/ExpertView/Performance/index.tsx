import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import groupby from 'lodash.groupby'
import { useTheme } from 'styled-components'
import { listen } from '@tauri-apps/api/event'

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

  useEffect(() => {
    // get data for the whole timeWindow whenever it changes
    // also set the `last` timestamp that is present in the dataset
    const getData = async () => {
      const data = await statsRepository.getGroupedByContainer(
        configuredNetwork,
        since,
      )

      const grouped = groupby(data.reverse(), 'service')
      Object.keys(grouped).forEach(key => {
        grouped[key] = guardBlanksWithNulls(
          grouped[key],
          Number(refreshRate.value),
        )
      })
      setData(grouped)
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

              setData(oldState => ({
                ...oldState,
                [containerChannel.service as string]: addDataWithBlankGuards(
                  oldState[containerChannel.service as string],
                  stats,
                  containerChannel.service as string,
                  configuredNetwork,
                  Number(refreshRate.value),
                ),
              }))
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

      <PerformanceChart
        data={data}
        chartHeight={175}
        enabled={!frozenCharts.cpu}
        from={since}
        to={now}
        extractor={useCallback(
          (statsEntry: StatsEntry) => ({
            timestamp: statsEntry.timestamp,
            value: statsEntry.cpu,
          }),
          [],
        )}
        onUserInteraction={useCallback(({ interacting }) => {
          if (interacting) {
            setFrozenCharts(oldState => ({
              ...oldState,
              cpu: true,
            }))

            return
          }

          setFrozenCharts(oldState => ({
            ...oldState,
            cpu: false,
          }))
        }, [])}
        percentageValues
        title={t.common.nouns.cpu}
        style={{ marginTop: theme.spacing() }}
      />

      <PerformanceChart
        data={data}
        chartHeight={175}
        enabled={!frozenCharts.memory}
        from={since}
        to={now}
        extractor={useCallback(
          (statsEntry: StatsEntry) => ({
            timestamp: statsEntry.timestamp,
            value: statsEntry.memory && statsEntry.memory,
          }),
          [],
        )}
        onUserInteraction={useCallback(({ interacting }) => {
          if (interacting) {
            setFrozenCharts(oldState => ({
              ...oldState,
              memory: true,
            }))

            return
          }

          setFrozenCharts(oldState => ({
            ...oldState,
            memory: false,
          }))
        }, [])}
        unit='MiB'
        title={t.common.nouns.memory}
        style={{ marginTop: theme.spacing() }}
      />
    </>
  )
}

export default PerformanceContainer
