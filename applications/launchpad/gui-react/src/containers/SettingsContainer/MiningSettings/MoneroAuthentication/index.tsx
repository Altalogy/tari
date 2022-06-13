import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import Button from '../../../../components/Button'
import Input from '../../../../components/Inputs/Input'
import PasswordInput from '../../../../components/Inputs/PasswordInput'
import Text from '../../../../components/Text'

import t from '../../../../locales'
import { AuthenticationInputs } from '../../types'

import {
  Description,
  InputWrapper,
  ModalContainer,
  ModalContent,
  ModalFooter,
} from './styles'

const MoneroAuthentication = ({
  defaultValues,
  setData,
  setOpenMiningAuthForm,
}: {
  defaultValues?: AuthenticationInputs
  setData: (data: AuthenticationInputs) => void
  setOpenMiningAuthForm: (value: boolean) => void
}) => {
  const { control, handleSubmit } = useForm<AuthenticationInputs>({
    mode: 'onChange',
    defaultValues: defaultValues,
  })

  const onSubmit: SubmitHandler<AuthenticationInputs> = async data => {
    setData(data)
    setOpenMiningAuthForm(false)
  }

  return (
    <ModalContainer>
      <ModalContent>
        <Text as='h2' type='subheader'>
          {t.mining.settings.moneroAuthFormTitle}
        </Text>
        <Description>
          <Text type='smallMedium'>{t.mining.settings.moneroAuthFormDesc}</Text>
        </Description>

        <InputWrapper>
          <Controller
            name='username'
            control={control}
            render={({ field }) => (
              <Input
                placeholder={t.mining.settings.authUsernamePlaceholder}
                label={t.mining.settings.authUsernameLabel}
                testId='monero-auth-username-input'
                value={field.value?.toString()}
                onChange={v => field.onChange(v)}
                autoFocus
              />
            )}
          />
        </InputWrapper>

        <InputWrapper>
          <Controller
            name='password'
            control={control}
            render={({ field }) => (
              <PasswordInput
                placeholder={t.mining.settings.authPasswordPlaceholder}
                label={t.mining.settings.authPasswordLabel}
                testId='monero-auth-password-input'
                value={field.value?.toString()}
                onChange={v => field.onChange(v)}
                useReveal
              />
            )}
          />
        </InputWrapper>
      </ModalContent>
      <ModalFooter>
        <Button
          variant='secondary'
          size='small'
          onClick={() => setOpenMiningAuthForm(false)}
          testId='monero-auth-close-btn'
        >
          {t.common.verbs.cancel}
        </Button>
        <Button
          size='small'
          onClick={() => handleSubmit(onSubmit)()}
          testId='monero-auth-submit-btn'
        >
          {t.common.verbs.submit}
        </Button>
      </ModalFooter>
    </ModalContainer>
  )
}

export default MoneroAuthentication
