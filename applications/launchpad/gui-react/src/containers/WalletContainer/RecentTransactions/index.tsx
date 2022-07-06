import { useState, useEffect } from 'react'
import { useTheme } from 'styled-components'
import Button from '../../../components/Button'

import Text from '../../../components/Text'
import TransactionsList from '../../../components/TransactionsList'

import useTransactionsRepository, {
  TransactionDBRecord,
} from '../../../persistence/transactionsRepository'

import SvgArrowSwap from '../../../styles/Icons/ArrowSwap'
import SvgClose from '../../../styles/Icons/Close'

import t from '../../../locales'

import {
  Header,
  LeftHeader,
  RightHeader,
  StyledTransactionsList,
  PaginationContainer,
} from './styles'
import Pagination from '../../../components/Pagination'
import { useAppSelector } from '../../../store/hooks'
import { selectLastTxHistoryUpdate } from '../../../store/wallet/selectors'

const CLOSE_HISTORY_PAGE_SIZE = 3
const ALL_HISTORY_PAGE_SIZE = 10

const RecentTransactions = () => {
  const transactionsRepository = useTransactionsRepository()
  const theme = useTheme()

  const lastTxHistoryUpdate = useAppSelector(selectLastTxHistoryUpdate)

  const [txs, setTxs] = useState<TransactionDBRecord[]>([])
  const [total, setTotal] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [seeAllHistory, setSeeAllHistory] = useState(false)

  useEffect(() => {
    const countRecords = async () => {
      const totalRecords = await transactionsRepository.count()
      setTotal(totalRecords)
    }

    countRecords()
  }, [lastTxHistoryUpdate])

  const selectTxs = async () => {
    const records = await transactionsRepository.list(
      seeAllHistory ? ALL_HISTORY_PAGE_SIZE : CLOSE_HISTORY_PAGE_SIZE,
      currentPage,
    )
    setTxs(records)
  }

  useEffect(() => {
    selectTxs()
  }, [seeAllHistory, currentPage, lastTxHistoryUpdate])

  if (txs.length === 0) {
    return null
  }

  return (
    <StyledTransactionsList>
      <Header>
        <LeftHeader>
          <SvgArrowSwap color={theme.disabledText} fontSize={20} />
          <Text
            as='span'
            type='defaultHeavy'
            style={{ marginLeft: theme.spacingVertical(1) }}
          >
            {t.wallet.recentTransactions}
          </Text>
        </LeftHeader>
        <RightHeader>
          {seeAllHistory ? (
            <Button
              variant='button-in-text'
              style={{ color: theme.onTextLight }}
              onClick={() => {
                setCurrentPage(0)
                setSeeAllHistory(false)
              }}
              leftIcon={<SvgClose />}
            >
              {t.wallet.closeAllHistory}
            </Button>
          ) : (
            <Button
              variant='button-in-text'
              style={{ color: theme.onTextLight }}
              onClick={() => setSeeAllHistory(true)}
            >
              {t.wallet.seeAllHistory}
            </Button>
          )}
        </RightHeader>
      </Header>
      <TransactionsList records={txs} />
      {seeAllHistory && total > ALL_HISTORY_PAGE_SIZE ? (
        <PaginationContainer>
          <Pagination
            currentPage={currentPage}
            perPage={ALL_HISTORY_PAGE_SIZE}
            total={total}
            onPageChange={(selected: number) => setCurrentPage(selected)}
          />
        </PaginationContainer>
      ) : null}
    </StyledTransactionsList>
  )
}

export default RecentTransactions
