import t from '../../../locales'

import Button from '../../../components/Button'
import Text from '../../../components/Text'

import SvgStar from '../../../styles/Icons/Star'
import SvgInfo1 from '../../../styles/Icons/Info1'
import { StyledMiningHeaderTip } from './styles'

/**
 * @TODO - draft - add other states
 */
const MiningHeaderTip = () => {
  return (
    <StyledMiningHeaderTip>
      <SvgStar />
      <Text>{t.mining.headerTips.oneStepAway}</Text>
      <Button type='link' href='https://google.com' rightIcon={<SvgInfo1 />}>
        {t.mining.headerTips.wantToKnowMore}
      </Button>
    </StyledMiningHeaderTip>
  )
}

export default MiningHeaderTip
