import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import groupby from 'lodash.groupby'
import { useTheme } from 'styled-components'

import { selectNetwork } from '../../../../store/baseNode/selectors'
import { useAppSelector } from '../../../../store/hooks'
import getStatsRepository, {
  StatsEntry,
} from '../../../../persistence/statsRepository'
import t from '../../../../locales'
import { Option } from '../../../../components/Select/types'
import TimeSeriesChart from '../../../../components/Charts/TimeSeries'
import { SeriesData } from '../../../../components/Charts/TimeSeries/types'
import { Dictionary } from '../../../../types/general'

import PerformanceChart from './PerformanceChart'
import PerformanceControls, {
  defaultRenderWindow,
  defaultRefreshRate,
} from './PerformanceControls'
import guardBlanksWithNulls from './guardBlanksWithNulls'

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
  const [data, setData] = useState<Dictionary<StatsEntry[]>>()
  const [lastTimestamp, setLastTimestamp] = useState<Date>(since)
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

      if (data.length) {
        setLastTimestamp(new Date(data[data.length - 1].timestamp))
      }
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
    // every time 'now' changes,
    // get new data since `last`
    // and add to the dataset
    if (!lastTimestamp) {
      return
    }

    const getData = async () => {
      const data = await statsRepository.getGroupedByContainer(
        configuredNetwork,
        lastTimestamp,
      )

      if (data.length) {
        setLastTimestamp(new Date(data[data.length - 1].timestamp))
      }
      const newGroupedData = groupby(data.reverse(), 'service')

      setData(previousData => {
        const newData = { ...previousData }
        Object.entries(newGroupedData).forEach(([key, newTimeSeries]) => {
          const oldTimeSeries = newData[key] || []
          const hasOldTimeSeries = oldTimeSeries.length

          const lastOldTimestamp = new Date(
            oldTimeSeries[oldTimeSeries.length - 1]?.timestamp,
          ).getTime()
          const firstNewTimestamp = new Date(
            newTimeSeries[0].timestamp,
          ).getTime()
          const difference = hasOldTimeSeries
            ? firstNewTimestamp - lastOldTimestamp
            : 0
          const newTimeSeriesWithNullGuard =
            !hasOldTimeSeries || difference > Number(refreshRate.value)
              ? [
                  {
                    timestamp: new Date(
                      firstNewTimestamp - Number(refreshRate.value),
                    ).toISOString(),
                    cpu: null,
                    memory: null,
                    download: null,
                    upload: null,
                    service: key,
                    network: configuredNetwork,
                  },
                  ...newTimeSeries,
                ]
              : newTimeSeries
          const oldTimeSeriesWithNullGuard =
            hasOldTimeSeries && difference > Number(refreshRate.value)
              ? [
                  ...oldTimeSeries,
                  {
                    timestamp: new Date(
                      lastOldTimestamp + Number(refreshRate.value),
                    ).toISOString(),
                    cpu: null,
                    memory: null,
                    download: null,
                    upload: null,
                    service: key,
                    network: configuredNetwork,
                  },
                ]
              : oldTimeSeries

          newData[key] = [
            ...oldTimeSeriesWithNullGuard,
            ...newTimeSeriesWithNullGuard,
          ]
        })

        return newData
      })
    }

    getData()
  }, [now, configuredNetwork])

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
            value: statsEntry.memory && statsEntry.memory / (1024 * 1024),
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
