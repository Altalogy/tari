import { useSelector } from 'react-redux'
import Switch from '../../components/Switch'

import Text from '../../components/Text'
import SvgSun from '../../styles/Icons/Sun'
import SvgMoon from '../../styles/Icons/Moon'

import MiningHeaderTip from './MiningHeaderTip'
import MiningViewActions from './MiningViewActions'

import { setTheme } from '../../store/app'
import { selectTheme } from '../../store/app/selectors'

import { NodesContainer } from './styles'
import MiningBoxTari from './MiningBoxTari'
import MiningBoxMerged from './MiningBoxMerged'
import { actions } from '../../store/wallet'
import { useAppDispatch } from '../../store/hooks'
import Button from '../../components/Button'
import SvgArrowLeft1 from '../../styles/Icons/ArrowLeft1'
import SvgWallet from '../../styles/Icons/Wallet'
import SvgSetting from '../../styles/Icons/Setting'

/**
 * The Mining dashboard
 */
const MiningContainer = () => {
  const dispatch = useAppDispatch()
  const currentTheme = useSelector(selectTheme)

  return (
    <div>
      <MiningHeaderTip />

      <NodesContainer>
        <MiningBoxTari />
        <MiningBoxMerged />
      </NodesContainer>

      <MiningViewActions />

      <button onClick={() => dispatch(actions.unlockWallet('pass'))}>
        Set pass
      </button>

      <button onClick={() => dispatch(actions.unlockWallet(''))}>
        Clear pass
      </button>

      <div style={{ marginTop: 80 }}>
        <button onClick={() => dispatch(setTheme('light'))}>
          Set light theme
        </button>
        <button onClick={() => dispatch(setTheme('dark'))}>
          Set dark theme
        </button>
        <div>
          <Text>Select theme</Text>
          <Switch
            leftLabel={<SvgSun width='1.4em' height='1.4em' />}
            rightLabel={<SvgMoon width='1.4em' height='1.4em' />}
            value={currentTheme === 'dark'}
            onClick={v => dispatch(setTheme(v ? 'dark' : 'light'))}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: 60,
          marginBottom: 60,
        }}
      >
        <div style={{ margin: 10 }}>
          <Button type='button' variant='primary'>
            Primary
          </Button>
        </div>
        <div style={{ margin: 10 }}>
          <Button
            type='button'
            variant='primary'
            rightIcon={<SvgSetting />}
            leftIcon={<SvgSetting />}
          >
            Primary
          </Button>
        </div>
        <div style={{ margin: 10 }}>
          <Button
            type='button'
            variant='primary'
            size='small'
            rightIcon={<SvgSetting />}
            leftIcon={<SvgSetting />}
          >
            Primary small
          </Button>
        </div>
        <div style={{ margin: 10 }}>
          <Button
            type='button'
            variant='primary'
            rightIcon={<SvgSetting />}
            leftIcon={<SvgSetting />}
            disabled={true}
          >
            Primary disabled
          </Button>
        </div>
        <div style={{ margin: 10 }}>
          <Button
            type='button'
            variant='primary'
            size='small'
            rightIcon={<SvgSetting />}
            leftIcon={<SvgSetting />}
            disabled={true}
          >
            Primary small disabled
          </Button>
        </div>

        <div style={{ margin: 10 }}>
          <Button type='button' variant='secondary'>
            secondary
          </Button>
        </div>
        <div style={{ margin: 10 }}>
          <Button
            type='button'
            variant='secondary'
            rightIcon={<SvgSetting />}
            leftIcon={<SvgSetting />}
          >
            secondary
          </Button>
        </div>
        <div style={{ margin: 10 }}>
          <Button
            type='button'
            variant='secondary'
            size='small'
            rightIcon={<SvgSetting />}
            leftIcon={<SvgSetting />}
          >
            secondary small
          </Button>
        </div>
        <div style={{ margin: 10 }}>
          <Button
            type='button'
            variant='secondary'
            rightIcon={<SvgSetting />}
            leftIcon={<SvgSetting />}
            disabled={true}
          >
            secondary disabled
          </Button>
        </div>
        <div style={{ margin: 10 }}>
          <Button
            type='button'
            variant='secondary'
            size='small'
            rightIcon={<SvgSetting />}
            leftIcon={<SvgSetting />}
            disabled={true}
          >
            secondary small disabled
          </Button>
        </div>

        <div style={{ margin: 10 }}>
          <Button type='button' variant='button-in-text'>
            button in text
          </Button>
        </div>
        <div style={{ margin: 10 }}>
          <Button
            type='button'
            variant='button-in-text'
            rightIcon={<SvgSetting />}
            leftIcon={<SvgSetting />}
          >
            button in text
          </Button>
        </div>
        <div style={{ margin: 10 }}>
          <Button
            type='button'
            variant='button-in-text'
            size='small'
            rightIcon={<SvgSetting />}
            leftIcon={<SvgSetting />}
          >
            button in text small
          </Button>
        </div>
        <div style={{ margin: 10 }}>
          <Button
            type='button'
            variant='button-in-text'
            rightIcon={<SvgSetting />}
            leftIcon={<SvgSetting />}
            disabled={true}
          >
            button in text disabled
          </Button>
        </div>

        <div style={{ margin: 10 }}>
          <Button type='button' variant='text'>
            Text Button
          </Button>
        </div>
        <div style={{ margin: 10 }}>
          <Button
            type='button'
            variant='text'
            rightIcon={<SvgSetting />}
            leftIcon={<SvgSetting />}
          >
            Text Button
          </Button>
        </div>
        <div style={{ margin: 10 }}>
          <Button
            type='button'
            variant='text'
            rightIcon={<SvgSetting />}
            leftIcon={<SvgSetting />}
            disabled={true}
          >
            Text Button disabled
          </Button>
        </div>

        <div style={{ margin: 10 }}>
          <Button type='button' variant='warning'>
            Warning Button
          </Button>
        </div>
        <div style={{ margin: 10 }}>
          <Button
            type='button'
            variant='warning'
            rightIcon={<SvgSetting />}
            leftIcon={<SvgSetting />}
          >
            Warning Button
          </Button>
        </div>
        <div style={{ margin: 10 }}>
          <Button
            type='button'
            variant='warning'
            size='small'
            rightIcon={<SvgSetting />}
            leftIcon={<SvgSetting />}
          >
            Warning Button small
          </Button>
        </div>
        <div style={{ margin: 10 }}>
          <Button
            type='button'
            variant='warning'
            rightIcon={<SvgSetting />}
            leftIcon={<SvgSetting />}
            disabled={true}
          >
            Warning Button disabled
          </Button>
        </div>
        <div style={{ margin: 10 }}>
          <Button
            type='button'
            variant='warning'
            size='small'
            rightIcon={<SvgSetting />}
            leftIcon={<SvgSetting />}
            disabled={true}
          >
            Warning Button small disabled
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MiningContainer
