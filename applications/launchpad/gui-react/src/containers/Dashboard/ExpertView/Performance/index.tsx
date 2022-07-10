import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import groupby from 'lodash.groupby'
import { listen } from '@tauri-apps/api/event'

import uPlot from 'uplot'
import UplotReact from 'uplot-react'

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

/**
 * @name PerformanceContainer
 * @description container component for performance statistics, renders filtering controls and performance charts
 * manages refresh rate and synchronizes refresh ticks for all charts
 * delegates chart rendering etc to other components
 *
 */
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
  const frozen = useRef(false)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (frozen.current) {
        return
      }
      const n = new Date()
      n.setMilliseconds(0)
      setNow(n)
    }, Number(refreshRate.value))

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return () => clearInterval(intervalRef.current!)
  }, [refreshRate, frozen])

  const [data, setData] = useState<
    {
      cpu: number | null
      memory: number | null
      download: number | null
      service: string
      timestampS: number
    }[]
  >([])
  const xValues = useMemo(() => {
    const x = []
    const nowS = now.getTime() / 1000
    const sinceS = since.getTime() / 1000
    for (let i = 0; i < nowS - sinceS; ++i) {
      x.push(sinceS + i)
    }

    return x
  }, [now, since, frozen])
  const cpuData = useMemo(() => {
    const grouped = groupby(data, 'service')
    const seriesData: Dictionary<number[]> = {}
    const sinceS = xValues[0]
    Object.keys(grouped)
      .sort()
      .forEach(key => {
        const yValues = new Array(xValues.length).fill(null)
        grouped[key].forEach(v => {
          const idx = v.timestampS - sinceS
          yValues[idx] = v.cpu
        })
        seriesData[key] = yValues
      })
    return seriesData
  }, [xValues, data])

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
  const colors = ['red', 'blue']

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

  const mouseLeave = useCallback(
    (_e: MouseEvent) => {
      console.debug('mouse leave')
      frozen.current = false

      return null
    },
    [since, now],
  )
  const mouseEnter = useCallback(
    (_e: MouseEvent) => {
      console.debug('mouse enter')
      frozen.current = true

      return null
    },
    [since, now],
  )

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
        onClick={() => {
          frozen.current = true
        }}
      >
        stop
      </button>
      <button
        style={{ color: 'white' }}
        onClick={() => {
          frozen.current = false
        }}
      >
        start
      </button>

      <div style={{ color: 'white' }}>
        <UplotReact
          options={{
            title: 'cpu',
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
                range: [0, 100],
              },
            },
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
