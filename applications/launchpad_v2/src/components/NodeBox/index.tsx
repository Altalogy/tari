import Box from '../Box'
import Tag from '../Tag'
import Text from '../Text'

import { BoxHeader, BoxContent } from './styles'
import { NodeBoxProps } from './types'

/**
 * The advanced Box component handling:
 * - custom title
 * - header tag
 * - background depending on the status prop
 *
 * Used as a UI representation of the Node (aka. Docker container).
 *
 * @param {string} [title] - the box heading
 * @param {NodeBoxStatusType} [status = 'inactive'] - the status of the box/node
 *
 * @example
 * TODO
 */
const NodeBox = ({ title, tag, children }: NodeBoxProps) => {
  return (
    <Box testId='node-box-cmp'>
      <BoxHeader>
        {tag ? (
          <Tag type={tag.type} variant='large'>
            {tag.text}
          </Tag>
        ) : null}
      </BoxHeader>
      {title ? (
        <Text as='h2' type='header'>
          {title}
        </Text>
      ) : null}
      <BoxContent>{children}</BoxContent>
    </Box>
  )
}

export default NodeBox
