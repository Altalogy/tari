import { useDispatch, useSelector } from 'react-redux'
import Tabs from '../../../../../components/Tabs'

import { setPage } from '../../../../../store/app'
import { ViewType } from '../../../../../store/app/types'
import { selectView } from '../../../../../store/app/selectors'
import { useEffect, useState } from 'react'

/**
 * Renders Dasboard tabs
 */
const DashboardTabs = () => {
  const dispatch = useDispatch()

  const currentPage = useSelector(selectView)

  const [tabs, setTabs] = useState([
    {
      id: 'MINING',
      content: <span>Mining</span>,
    },
    {
      id: 'BASE_NODE',
      content: <span>Base Node</span>,
    },
    {
      id: 'WALLET',
      content: <span>Wallet</span>,
    },
  ])

  // useEffect(() => {}, [])

  const setPageTab = (tabId: string) => {
    dispatch(setPage(tabId as ViewType))
  }

  return (
    <Tabs
      tabs={tabs}
      selected={currentPage || 'MINING'}
      onSelect={setPageTab}
    />
  )
}

export default DashboardTabs
