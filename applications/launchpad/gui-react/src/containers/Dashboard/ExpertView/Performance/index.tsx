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
  const [cpuData, setCpuData] = useState<Dictionary<(number | null)[]>>({})

  useEffect(() => {
    const xValues = []
    const nowS = now.getTime() / 1000
    const sinceS = since.getTime() / 1000
    for (let i = 0; i < nowS - sinceS; ++i) {
      xValues.push(sinceS + i)
    }
    setXValues(xValues)

    // get data for the whole timeWindow whenever it changes
    // also set the `last` timestamp that is present in the dataset
    const getData = async () => {
      const data = await statsRepository.getGroupedByContainer(
        configuredNetwork,
        since,
      )

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
      setCpuData(seriesData)
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
              const statsTimestampS = new Date(stats.timestamp).getTime() / 1000
              // this should be a reference/state on the component, I think
              let lastX = 0

              setXValues(oldState => {
                lastX = oldState[oldState.length - 1]

                const diff = statsTimestampS - lastX
                const additionalTimestamps = []
                for (let i = 0; i < diff; ++i) {
                  additionalTimestamps.push(lastX + 1 + i)
                }

                return [...oldState, ...additionalTimestamps]
              })

              setCpuData(oldState => {
                const newState = { ...oldState }

                const emptyValues = []
                const diff = statsTimestampS - lastX
                for (let i = 1; i < diff; ++i) {
                  emptyValues.push(null)
                }
                newState[containerChannel.service as string] = [
                  ...(newState[containerChannel.service as string] || []),
                  ...emptyValues,
                  stats.cpu,
                ]

                return newState
              })
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

      <div style={{ color: 'white' }}>
        <UplotReact
          options={{
            title: 'cpu',
            width: 500,
            height: 175,
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
