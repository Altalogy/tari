import { useState } from 'react'
import { useTheme } from 'styled-components'

import Tag from '../../../components/Tag'
import Text from '../../../components/Text'
import Button from '../../../components/Button'
import CopyBox from '../../../components/CopyBox'
import Modal from '../../../components/Modal'
import PasswordBox from '../../../containers/WalletContainer/PasswordBox'
import t from '../../../locales'

import { IsWalletRunningRow, WalletRunningContainer } from './styles'

const WalletSettings = ({
  running,
  pending,
  address,
  stop,
  start,
}: {
  running: boolean
  pending: boolean
  address: string
  stop: () => void
  start: (password: string) => void
}) => {
  const theme = useTheme()
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  return (
    <>
      <Text type='header'>{t.wallet.settings.title}</Text>
      <IsWalletRunningRow>
        <WalletRunningContainer>
          <Text>{t.common.nouns.wallet}</Text>
          {running && (
            <Tag variant='small' type='running'>
              <span>{t.common.adjectives.running}</span>
            </Tag>
          )}
        </WalletRunningContainer>
        {running && (
          <Button variant='secondary' onClick={stop} loading={pending}>
            {t.common.verbs.stop}
          </Button>
        )}
        {/* TODO show password box when starting */}
        {!running && (
          <Button onClick={() => setShowPasswordModal(true)} loading={pending}>
            {t.common.verbs.start}
          </Button>
        )}
      </IsWalletRunningRow>
      <Modal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        local
        size='auto'
      >
        <PasswordBox
          pending={false}
          onSubmit={password => {
            setShowPasswordModal(false)
            start(password)
          }}
          style={{ margin: 0 }}
        />
      </Modal>
      <CopyBox
        label={`${t.wallet.wallet.walletId} (${t.wallet.wallet.address})`}
        value={address}
      />
      <Text type='smallMedium' color={theme.secondary}>
        {t.wallet.settings.explanations.storage}{' '}
        {t.wallet.settings.explanations.send} (
        {t.wallet.settings.explanations.try}{' '}
        <Button href='https://aurora.tari.com/'>
          {t.wallet.settings.explanations.aurora}
        </Button>{' '}
        - {t.wallet.settings.explanations.itsGreat}){' '}
        {t.wallet.settings.explanations.extendedFunctionality}{' '}
        {t.wallet.settings.explanations.convert}
      </Text>
    </>
  )
}

export default WalletSettings
