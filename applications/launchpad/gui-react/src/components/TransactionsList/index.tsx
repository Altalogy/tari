import SvgArrowSwap from '../../styles/Icons/ArrowSwap'
import Text from '../Text'

import t from '../../locales'

import {
  Header,
  LeftHeader,
  RightHeader,
  StyledTransactionsList,
  DirectionTag,
  StyledAddress,
  StyledTable,
  AmountTd,
  DateTd,
  DirectionTd,
  EventTd,
  StatusTd,
} from './styles'
import { TransactionsListProps } from './types'
import { TransactionDBRecord } from '../../persistence/transactionsRepository'
import SvgArrowLeft from '../../styles/Icons/ArrowLeft'
import Tag from '../Tag'
import { toT } from '../../utils/Format'

const convertU8ToString = (data: string) => {
  try {
    if (!data || data === '[]') {
      return ''
    }
    const parsed = data.replace('[', '').replace(']', '').split(',')
    return parsed.map(c => String.fromCharCode(Number(c))).join('')
  } catch (_) {
    return ''
  }
}

const trimAddress = (address: string, start = 4, end = 4) => {
  return (
    address.substring(0, start) +
    '...' +
    address.substring(address.length - end, address.length)
  )
}

const renderStatus = (record: TransactionDBRecord) => {
  /**
   * @TODO find a list of possible statuses and which are 'processing', or 'failed'
   */
  if (record.status.toLowerCase() !== 'coinbase') {
    return <Tag>{t.common.adjectives.processing}</Tag>
  }

  return null
}

const addNth = (day: number) => {
  const dString = String(day)
  const last = +dString.slice(-2)
  if (last > 3 && last < 21) return 'th'
  switch (last % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const options = { day: 'numeric', month: 'short' } as const
  const localeDate = date.toLocaleDateString(undefined, options)
  const splt = localeDate.split(' ')
  return splt[0] + addNth(date.getDate()) + ' ' + splt[1]
}

const InboundTxRow = ({ record }: { record: TransactionDBRecord }) => {
  return (
    <tr>
      <DirectionTd>
        <DirectionTag $variant='earned'>
          <SvgArrowLeft style={{ transform: 'rotate(-45deg)' }} />
        </DirectionTag>
      </DirectionTd>
      <EventTd>
        <Text as='span'>
          {t.wallet.transactions.youReceivedTariFrom}{' '}
          <StyledAddress>
            {trimAddress(convertU8ToString(record.source))}
          </StyledAddress>
        </Text>
      </EventTd>
      <StatusTd>{renderStatus(record)}</StatusTd>
      <DateTd>
        <Text as='span' type='smallMedium'>
          {formatDate(record.receivedAt.toString())}
        </Text>
      </DateTd>
      <AmountTd $variant='earned'>
        <Text as='span' type='defaultHeavy'>
          {parseFloat(toT(record.amount).toString()).toFixed(2)}{' '}
        </Text>
        <Text as='span' type='microMedium'>
          XTR
        </Text>
      </AmountTd>
    </tr>
  )
}

const TransactionsList = ({ records }: TransactionsListProps) => {
  return (
    <StyledTransactionsList>
      <Header>
        <LeftHeader>
          <SvgArrowSwap />
          <Text as='span' type='defaultHeavy'>
            {t.wallet.recentTransactions}
          </Text>
        </LeftHeader>
        <RightHeader>History all</RightHeader>
      </Header>
      <StyledTable>
        <tbody>
          {records.map((row, idx) => (
            <InboundTxRow record={row} key={idx} />
          ))}
        </tbody>
      </StyledTable>
    </StyledTransactionsList>
  )
}

export default TransactionsList
