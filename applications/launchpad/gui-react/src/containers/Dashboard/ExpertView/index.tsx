import { useState } from 'react'
import { useTheme } from 'styled-components'

import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { setExpertView } from '../../../store/app'
import { selectExpertView } from '../../../store/app/selectors'
import { selectRootState } from '../../../store'
import Tabs from '../../../components/Tabs'
import Button from '../../../components/Button'
import TabContent from '../../../components/TabContent'
import ExpandIcon from '../../../styles/Icons/Monitor'
import CollapseIcon from '../../../styles/Icons/Grid'
import { MainContainer } from '../../../layouts/MainLayout/styles'
import t from '../../../locales'

import Containers from './Containers'
import { TabsContainer } from './styles'

const ExpertView = () => {
  const dispatch = useAppDispatch()
  const expertView = useAppSelector(selectExpertView)
  const rootState = useAppSelector(selectRootState)
  const theme = useTheme()
  const [selectedTab, setTab] = useState('CONTAINERS')

  const isFullscreen = expertView === 'fullscreen'

  const tabs = [
    {
      id: 'PERFORMANCE',
      content: <TabContent text={t.common.nouns.performance} />,
    },
    {
      id: 'CONTAINERS',
      content: <TabContent text={t.common.nouns.containers} />,
    },
    {
      id: 'LOGS',
      content: <TabContent text={t.common.nouns.logs} />,
    },
  ]

  const renderPage = () => {
    switch (selectedTab) {
      case 'PERFORMANCE':
        return <p style={{ color: 'white' }}>performance tab</p>
      case 'CONTAINERS':
        return <Containers />
      case 'LOGS':
        return <p style={{ color: 'white' }}>logs tab</p>
      default:
        return null
    }
  }

  return (
    <MainContainer
      style={{ paddingRight: theme.spacing(), paddingLeft: theme.spacing() }}
    >
      <TabsContainer>
        <Tabs tabs={tabs} selected={selectedTab} onSelect={setTab} inverted />
        {!isFullscreen && (
          <Button
            variant='text'
            leftIcon={<ExpandIcon width='20px' height='20px' />}
            style={{ paddingRight: 0, paddingLeft: 0 }}
            onClick={() => dispatch(setExpertView('fullscreen'))}
          >
            {t.expertView.fullscreen.open}
          </Button>
        )}
        {isFullscreen && (
          <Button
            variant='text'
            leftIcon={<CollapseIcon width='20px' height='20px' />}
            style={{ paddingRight: 0, paddingLeft: 0 }}
            onClick={() => dispatch(setExpertView('open'))}
          >
            {t.expertView.fullscreen.close}
          </Button>
        )}
      </TabsContainer>
      {renderPage()}
      <pre style={{ color: 'white' }}>
        {JSON.stringify(rootState.containers, null, 2)}
      </pre>
    </MainContainer>
  )
}

export default ExpertView
