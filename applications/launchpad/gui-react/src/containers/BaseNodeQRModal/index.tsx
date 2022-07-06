import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import { useTheme } from 'styled-components'
import Button from '../../components/Button'

import Modal from '../../components/Modal'
import Text from '../../components/Text'

import t from '../../locales'
import { selectNetwork } from '../../store/baseNode/selectors'
import { useAppSelector } from '../../store/hooks'
import { selectWalletAddress } from '../../store/wallet/selectors'
import {
  ModalContainer,
  Content,
  CtaButton,
  Steps,
  Instructions,
  QRContainer,
} from './styles'

import { BaseNodeQRModalProps } from './types'

/**
 * The modal rendering the Base Node address as QR code.
 * @param {boolean} open - show modal
 * @param {() => void} onClose - on modal close
 */
const BaseNodeQRModal = ({ open, onClose }: BaseNodeQRModalProps) => {
  const theme = useTheme()
  const address = useAppSelector(selectWalletAddress)
  const network = useAppSelector(selectNetwork)

  /**
   * @TODO Get following publicKey and baseNodeId from backend.
   */
  const publicKey = 'TODO_PUBLIC_KEY'
  const baseNodeId = 'TODO_BASE_NODE_ID'

  const [qrUrl, setQrUrl] = useState('')

  useEffect(() => {
    setQrUrl(
      `tari://${network}/base_nodes/add?name=${baseNodeId}&peer=${publicKey}::${address}`,
    )
  }, [address, network])

  return (
    <Modal open={open} onClose={onClose} size='small'>
      <ModalContainer>
        <Content>
          <Text as='h2' type='subheader' color={theme.primary}>
            {t.baseNode.qrModal.heading}
          </Text>
          <Instructions>
            <Text type='smallMedium'>{t.baseNode.qrModal.description}</Text>
            <Steps>
              <li>
                <Text as='span' type='smallMedium'>
                  {t.baseNode.qrModal.step1}
                </Text>
              </li>
              <li>
                <Text as='span' type='smallMedium'>
                  {t.baseNode.qrModal.step2}
                </Text>
              </li>
              <li>
                <Text as='span' type='smallMedium'>
                  {t.baseNode.qrModal.step3}
                </Text>
              </li>
              <li>
                <Text as='span' type='smallMedium'>
                  {t.baseNode.qrModal.step4}
                </Text>
              </li>
            </Steps>
          </Instructions>

          <QRContainer>
            <QRCode
              value={qrUrl}
              level='H'
              size={220}
              data-testid='base-node-qr-code'
            />
          </QRContainer>
        </Content>
        <CtaButton>
          <Button onClick={onClose} fullWidth>
            {t.baseNode.qrModal.submitBtn}
          </Button>
        </CtaButton>
      </ModalContainer>
    </Modal>
  )
}

export default BaseNodeQRModal
