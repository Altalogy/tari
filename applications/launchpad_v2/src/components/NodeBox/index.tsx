import Box from '../Box'
import Text from '../Text'

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
const NodeBox = ({ title, status = 'inactive' }: NodeBoxProps) => {
  return (
    <Box testId='node-box-cmp'>
      {title ? <Text>{title}</Text> : null}
      <p>The box {status}</p>
    </Box>
  )
}

export default NodeBox
