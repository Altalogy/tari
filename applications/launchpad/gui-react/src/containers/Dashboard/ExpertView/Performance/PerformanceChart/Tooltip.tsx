import { useTheme } from 'styled-components'

import Text from '../../../../../components/Text'
import * as Format from '../../../../../utils/Format'
import t from '../../../../../locales'

import { TooltipWrapper } from './styles'

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
      {Boolean(values) && (
        <ul>
          {(values || [])
            .filter(v => Boolean(v.value))
            .map(v => (
              <li key={`${v.service}${v.value}`}>
                <Text type='smallMedium' color={theme.inverted.lightTagText}>
                  {t.common.containers[v.service]}{' '}
                  <span style={{ color: theme.inverted.primary }}>
                    {v.value}
                    {v.unit}
                  </span>
                </Text>
              </li>
            ))}
        </ul>
      )}
      {Boolean(x) && (
        <Text type='smallMedium' color={theme.inverted.lightTagText}>
          {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
          {Format.dateTime(x!)}
        </Text>
      )}
    </TooltipWrapper>
  )
}

export default Tooltip
