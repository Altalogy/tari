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
import { Dictionary } from '../../../../types/general'

import PerformanceChart from './PerformanceChart'
import PerformanceControls, {
  defaultRenderWindow,
  defaultRefreshRate,
} from './PerformanceControls'

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
  const [lastTimestamp, setLastTimestamp] = useState<Date | undefined>()
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>()
  const [lastNowForGraph, setLastNowForGraph] = useState<{
    cpu?: Date
    memory?: Date
    network?: Date
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
      setData(groupby(data.reverse(), 'service'))
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
        Object.entries(newGroupedData).forEach(([key, value]) => {
          newData[key] = [...(newData[key] || []), ...value]
        })

        return newData
      })
    }

    getData()
  }, [now])

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
          () => setLastNowForGraph({ cpu: now, memory: now, network: now }),
          [now],
        )}
      >
        stop
      </button>
      <button style={{ color: 'white' }} onClick={() => setLastNowForGraph({})}>
        start
      </button>
      {/*
<PerformanceChart
        enabled={refreshEnabled.cpu}
        extractor={({ timestamp, cpu }) => ({
          timestamp,
          value: cpu,
        })}
        percentageValues
        from={since}
        to={now}
        title={t.common.nouns.cpu}
        onUserInteraction={({ interacting }) => {
          setRefreshEnabled(a => ({
            ...a,
            cpu: !interacting,
          }))
        }}
        style={{ marginTop: theme.spacing() }}
        chartHeight={175}
      />
        */}
    </>
  )
}

export default PerformanceContainer
