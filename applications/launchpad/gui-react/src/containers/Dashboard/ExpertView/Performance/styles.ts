import styled from 'styled-components'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ChartContainer = styled.div<{ ref?: any }>`
  color: ${({ theme }) => theme.inverted.primary};
  background-color: ${({ theme }) => theme.inverted.backgroundSecondary};
  padding: ${({ theme }) => theme.spacing()};
  padding-left: ${({ theme }) => theme.spacing(0.5)};
  border-radius: ${({ theme }) => theme.borderRadius()};
  max-width: 100%;
  margin-top: ${({ theme }) => theme.spacing()};
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const Legend = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-left: ${({ theme }) => theme.spacing()};
  column-gap: ${({ theme }) => theme.spacing()};
`

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  column-gap: ${({ theme }) => theme.spacing(0.5)};
  min-height: 1em;
`

export const SeriesColorIndicator = styled.div<{ color: string }>`
  width: 1em;
  height: 0.1em;
  border-radius: 2px;
  background-color: ${({ color }) => color};
`
