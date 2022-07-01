import { useState, useEffect } from 'react'
import TransactionsList from '../../../components/TransactionsList'

import useTransactionsRepository, {
  TransactionDBRecord,
} from '../../../persistence/transactionsRepository'

const RecentTransactions = () => {
  const transactionsRepository = useTransactionsRepository()

  const [txs, setTxs] = useState<TransactionDBRecord[]>([])

  useEffect(() => {
    const selectTxs = async () => {
      const records = await transactionsRepository.getRecent(5)
      console.log('records', records)
      setTxs(records)
    }

    selectTxs()
  }, [])

  return <TransactionsList records={txs} />
}

export default RecentTransactions
