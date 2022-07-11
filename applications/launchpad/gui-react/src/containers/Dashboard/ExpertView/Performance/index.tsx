import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react'
import groupby from 'lodash.groupby'
import { useTheme } from 'styled-components'
import { listen } from '@tauri-apps/api/event'

import uPlot from 'uplot'
import UplotReact from 'uplot-react'

import t from '../../../../locales'
import colors from '../../../../styles/styles/colors'
import { selectNetwork } from '../../../../store/baseNode/selectors'
import { selectExpertView } from '../../../../store/app/selectors'
import { selectAllContainerEventsChannels } from '../../../../store/containers/selectors'
import { extractStatsFromEvent } from '../../../../store/containers/thunks'
import { StatsEventPayload } from '../../../../store/containers/types'
import { useAppSelector } from '../../../../store/hooks'
import getStatsRepository from '../../../../persistence/statsRepository'
import { Option } from '../../../../components/Select/types'
import Text from '../../../../components/Text'
import IconButton from '../../../../components/IconButton'
import { Dictionary } from '../../../../types/general'
import VisibleIcon from '../../../../styles/Icons/Eye'
import HiddenIcon from '../../../../styles/Icons/EyeSlash'
import * as Format from '../../../../utils/Format'

import {
  ChartContainer,
  Legend,
  LegendItem,
  SeriesColorIndicator,
  TooltipWrapper,
} from './styles'

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

const Tooltip = ({
  display,
  left,
  top,
  values,
  x,
}: {
  display?: boolean
  left?: number
  top?: number
  values?: {
    service: string
    value: number | null
    unit: string
  }[]
  x?: Date
}) => {
  const theme = useTheme()

  return (
    <TooltipWrapper
      style={{
        display: display ? 'block' : 'none',
        left,
        top,
      }}
    >
      {(values || [])
        .filter(v => Boolean(v.value))
        .map(v => (
          <Fragment key={`${v.service}${v.value}`}>
            <Text as='span' color={theme.inverted.lightTagText}>
              {t.common.containers[v.service]}
            </Text>{' '}
            <Text as='span'>
              {v.value}
              {v.unit}
            </Text>
          </Fragment>
        ))}
      {Boolean(x) && (
        <Text color={theme.inverted.lightTagText}>{Format.dateTime(x!)}</Text>
      )}
    </TooltipWrapper>
  )
}

const PerformanceChart = ({
  since,
  now,
  data,
  getter,
  title,
  width,
  percentage,
  unit,
}: {
  since: Date
  now: Date
  data: MinimalStatsEntry[]
  getter: (se: MinimalStatsEntry) => number | null
  title: string
  width: number
  percentage?: boolean
  unit?: string
}) => {
  const theme = useTheme()
  const unitToDisplay = percentage ? '%' : unit || ''

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
    let min = 0
    let max = 0
    Object.keys(grouped)
      .sort()
      .forEach(key => {
        const yValues = new Array(xValues.length).fill(null)
        grouped[key].forEach(v => {
          const idx = v.timestampS - sinceS
          if (idx < yValues.length) {
            yValues[idx] = getter(v)
            min = Math.min(min, yValues[idx])
            max = Math.max(max, yValues[idx])
          }
        })
        seriesData[key] = yValues
      })
    return {
      seriesData,
      min,
      max,
    }
  }, [xValues, getter])
  const [tooltipState, setTooltipState] = useState<{
    show?: boolean
    left?: number
    top?: number
    x?: Date
    values?: {
      service: string
      unit: string
      value: number | null
    }[]
  } | null>(null)
  const setTooltipValues = useCallback((u: any) => {
    const { left, top, idx } = u.cursor
    const x = u.data[0][idx]
    const values: {
      service: string
      value: number | null
      unit: string
    }[] = []
    for (let i = 1; i < u.data.length; i++) {
      values.push({
        service: u.series[i].label,
        unit: u.series[i].unit,
        value: u.data[i][idx].toFixed(2),
      })
    }

    setTooltipState(st => ({ ...st, left, top, x: new Date(x * 1000), values }))
  }, [])

  const mouseLeave = useCallback((_e: MouseEvent) => {
    setFrozen(false)
    setTooltipState(st => ({ ...st, show: false }))

    return null
  }, [])
  const mouseEnter = useCallback((_e: MouseEvent) => {
    setFrozen(true)
    setTooltipState(st => ({ ...st, show: true }))

    return null
  }, [])

  const [hiddenSeries, setHiddenSeries] = useState<string[]>([])

  const options = useMemo(
    () => ({
      width,
      height: 175,
      legend: {
        show: false,
      },
      hooks: {
        setCursor: [setTooltipValues],
      },
      cursor: {
        bind: {
          mouseenter: () => mouseEnter,
          mouseleave: () => mouseLeave,
        },
      },
      scales: {
        '%': {
          auto: false,
          range: (_u: any, _dataMin: number, _dataMax: number) => {
            return [0, 100] as [number | null, number | null]
          },
        },
        y: {
          auto: false,
          min: chartData.min,
          max: chartData.max,
          range: (_u: any, dataMin: number, dataMax: number) =>
            [dataMin, dataMax] as [number | null, number | null],
        },
      },
      series: [
        {},
        ...Object.keys(chartData.seriesData).map((key, id) => ({
          unit: unitToDisplay,
          auto: false,
          show: !hiddenSeries.includes(key),
          scale: percentage ? '%' : 'y',
          label: key,
          stroke: chartColors[id],
          fill: `${chartColors[id]}33`,
        })),
      ],
      axes: [
        {
          grid: {
            show: true,
            stroke: theme.inverted.resetBackground,
            width: 0.5,
          },
          ticks: {
            show: true,
            stroke: theme.inverted.resetBackground,
            width: 0.5,
          },
          show: true,
          side: 2,
          labelSize: 8 + 12 + 8,
          stroke: theme.inverted.secondary,
          values: (
            _uPlot: any,
            splits: number[],
            _axisIdx: number,
            _foundSpace: number,
            _foundIncr: number,
          ) => {
            return splits.map(split => Format.localHour(new Date(split * 1000)))
          },
        },
        {
          scale: percentage ? '%' : 'y',
          show: true,
          splits: percentage ? [0, 25, 50, 75, 100] : undefined,
          side: 3,
          values: (
            _uPlot: any,
            splits: number[],
            _axisIdx: number,
            _foundSpace: number,
            _foundIncr: number,
          ) => {
            return splits
          },
          stroke: theme.inverted.secondary,
          grid: {
            show: true,
            stroke: theme.inverted.resetBackground,
            width: 0.5,
          },
          ticks: {
            show: true,
            stroke: theme.inverted.resetBackground,
            width: 0.5,
          },
        },
      ],
    }),
    [mouseEnter, mouseLeave, chartData, hiddenSeries, width, percentage],
  )

  const toggleSeries = (name: string) => {
    setHiddenSeries(hidden => {
      if (hidden.includes(name)) {
        return hidden.filter(h => h !== name)
      }

      return [...hidden, name]
    })
  }

  return (
    <ChartContainer>
      <Text type='defaultHeavy'>{title}</Text>
      <div style={{ position: 'relative' }}>
        <Tooltip
          display={Boolean(tooltipState?.show)}
          left={tooltipState?.left}
          top={tooltipState?.top}
          values={tooltipState?.values}
          x={tooltipState?.x}
        />
        <UplotReact
          options={options}
          data={[xValues, ...Object.values(chartData.seriesData)]}
        />
        <Legend>
          {Object.keys(chartData.seriesData).map((name, seriesId) => (
            <LegendItem key={name}>
              <SeriesColorIndicator color={chartColors[seriesId]} />
              <Text type='smallMedium' color={theme.textSecondary}>
                {t.common.containers[name]}
              </Text>
              <IconButton onClick={() => toggleSeries(name)}>
                {hiddenSeries.includes(name) ? <VisibleIcon /> : <HiddenIcon />}
              </IconButton>
            </LegendItem>
          ))}
        </Legend>
      </div>
    </ChartContainer>
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
const networkGetter = (se: MinimalStatsEntry) =>
  (se.download || 0) / (1024 * 1024)
const PerformanceContainer = () => {
  const configuredNetwork = useAppSelector(selectNetwork)
  const expertView = useAppSelector(selectExpertView)
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
  const counter = useRef(1)
  useEffect(() => {
    if (counter.current++ % 5 === 0) {
      const sinceS = new Date(since).getTime() / 1000
      setData(oldState => oldState.filter(d => d.timestampS > sinceS))
    }
  }, [since])

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

  const containerRef = useRef<HTMLDivElement | null>(null)
  const width = useMemo(() => {
    // TODO force small
    if (expertView === 'open') {
      return 532
    }

    return containerRef.current?.getBoundingClientRect().width || 532
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
        title='cpu'
        getter={cpuGetter}
        width={width}
        percentage
      />

      <PerformanceChart
        since={since}
        now={now}
        data={data}
        title='memory'
        getter={memoryGetter}
        width={width}
        unit='kiB'
      />

      <PerformanceChart
        since={since}
        now={now}
        data={data}
        title='network download'
        getter={networkGetter}
        width={width}
        unit='MiB/s'
      />
    </div>
  )
}

export default PerformanceContainer
