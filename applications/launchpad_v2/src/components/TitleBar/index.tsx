import { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { animated, useSpring } from 'react-spring'
import { appWindow } from '@tauri-apps/api/window'

import Button from '../Button'
import Logo from '../Logo'
import Switch from '../Inputs/Switch'

import { selectExpertView } from '../../store/app/selectors'

import SvgCloseCross from '../../styles/Icons/CloseCross'
import SvgSetting from '../../styles/Icons/Setting2'

import { toggleExpertView } from '../../store/app'
import ExpertViewUtils from '../../utils/ExpertViewUtils'

import {
  LeftCol,
  LogoContainer,
  TitleBar as StyledTitleBar,
  TitleBarButton,
  WindowButtons,
} from './styles'
import { TitleBarProps } from './types'

const TitleBar = ({ drawerViewWidth = '50%' }: TitleBarProps) => {
  const dispatch = useDispatch()

  const expertView = useSelector(selectExpertView)
  const theme = useContext(ThemeContext)

  const [expertViewSize] = ExpertViewUtils.convertExpertViewModeToValue(
    expertView,
    drawerViewWidth,
  )

  const drawerContainerStyle = ExpertViewUtils.drawerAnim(expertViewSize)

  const logoColorAnim = useSpring({
    color: expertView === 'fullscreen' ? theme.background : theme.primary,
  })

  const buttonIconStyle = { width: 12, height: 12 }

  const titleBarBgAnim = useSpring({
    background: theme.backgroundSecondary,
  })

  const onMinimize = () => {
    appWindow.minimize()
  }

  const onMaximize = () => {
    appWindow.maximize()
  }

  const onClose = () => {
    appWindow.close()
  }

  const onExpertViewClick = () => {
    if (expertView !== 'hidden') {
      dispatch(toggleExpertView('hidden'))
    } else {
      dispatch(toggleExpertView('open'))
    }
  }

  return (
    <StyledTitleBar
      style={{
        ...titleBarBgAnim,
      }}
    >
      <LeftCol data-tauri-drag-region>
        <WindowButtons>
          <TitleBarButton
            borderColor='#D24F43'
            background='#ED695E'
            onClick={onClose}
            data-testid='close-window-btn'
          >
            <SvgCloseCross
              style={{
                ...buttonIconStyle,
                color: '#BE493F',
                opacity: 0,
              }}
            />
          </TitleBarButton>
          <TitleBarButton
            borderColor='#D8A040'
            background='#F6BD50'
            onClick={onMinimize}
            data-testid='minimize-window-btn'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='10'
              height='2'
              viewBox='0 0 10 2'
              fill='none'
              style={{
                opacity: 0,
              }}
            >
              <path
                d='M1 1H9'
                stroke='#C2903A'
                strokeWidth='1.5'
                strokeLinecap='round'
              />
            </svg>
          </TitleBarButton>
          <TitleBarButton
            borderColor='#51A73E'
            background='#61C354'
            style={{ padding: 0 }}
            onClick={onMaximize}
            data-testid='maximize-window-btn'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='17'
              height='16'
              viewBox='0 0 17 16'
              fill='none'
              style={{
                opacity: 0,
              }}
            >
              <path
                d='M4.04504 4.32699C4.04331 3.99321 4.31434 3.72219 4.64812 3.72391L9.99044 3.75145C10.5235 3.7542 10.7885 4.39878 10.4116 4.77571L5.09683 10.0905C4.7199 10.4674 4.07532 10.2024 4.07257 9.66932L4.04504 4.32699Z'
                fill='#407C33'
              />
              <path
                d='M11.7442 12.0263C12.078 12.028 12.349 11.757 12.3473 11.4232L12.3197 6.08085C12.317 5.5478 11.6724 5.28275 11.2955 5.65968L5.98068 10.9745C5.60376 11.3514 5.86881 11.996 6.40185 11.9987L11.7442 12.0263Z'
                fill='#407C33'
              />
            </svg>
          </TitleBarButton>
        </WindowButtons>

        <LogoContainer style={{ ...logoColorAnim }}>
          <Logo variant='full' />
        </LogoContainer>
      </LeftCol>

      <div
        data-tauri-drag-region
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          zIndex: 1,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderTopRightRadius: 10,
        }}
      >
        <animated.div
          data-tauri-drag-region
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            background: '#2a2a2a',
            borderTopRightRadius: 10,
            borderTopLeftRadius: expertViewSize === '100%' ? 10 : 0,
            ...drawerContainerStyle,
          }}
        />
      </div>
      <animated.div
        style={{
          position: 'absolute',
          top: 0,
          right: 16,
          padding: 16,
          zIndex: 12,
          display: 'flex',
          height: '100%',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        <Button variant='text' leftIcon={<SvgSetting />}>
          Settings
        </Button>
        <Switch
          value={expertView !== 'hidden'}
          label='Expert view'
          onClick={onExpertViewClick}
          testId={'titlebar-expert-view-btn'}
          invertedStyle={expertView !== 'hidden'}
        />
      </animated.div>
    </StyledTitleBar>
  )
}

export default TitleBar
