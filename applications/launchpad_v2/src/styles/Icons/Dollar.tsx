import * as React from 'react'
import { SVGProps } from 'react'

const SvgDollar = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width='1em'
    height='1em'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      d='M2.885 8.849a7.353 7.353 0 0 1 5.546-5.407l.453-.101a14.401 14.401 0 0 1 6.232 0l.453.1a7.353 7.353 0 0 1 5.546 5.408c.514 2.07.514 4.233 0 6.302a7.353 7.353 0 0 1-5.546 5.407l-.453.101a14.402 14.402 0 0 1-6.232 0l-.453-.1a7.353 7.353 0 0 1-5.546-5.408 13.077 13.077 0 0 1 0-6.302Z'
      stroke='currentColor'
      strokeWidth={1.5}
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M12 7c.383 0 .693.292.693.652v.534h.076C14.057 8.186 15 9.24 15 10.419c0 .36-.31.652-.692.652-.383 0-.693-.292-.693-.652 0-.568-.434-.929-.846-.929h-.076v2.053l.934.32a2.03 2.03 0 0 1-.66 3.95h-.274v.535c0 .36-.31.652-.693.652-.382 0-.692-.292-.692-.652v-.534h-.077C9.943 15.814 9 14.76 9 13.581c0-.36.31-.652.692-.652.383 0 .693.292.693.652 0 .568.434.929.846.929h.077v-2.053l-.935-.32a2.03 2.03 0 0 1 .66-3.95h.275V7.65c0-.36.31-.652.692-.652Zm-.692 2.49h-.275c-.302 0-.648.27-.648.726 0 .349.215.61.46.695l.463.158V9.49Zm1.385 3.441v1.579h.274c.302 0 .648-.27.648-.726 0-.349-.215-.61-.46-.695l-.462-.158Z'
      fill='currentColor'
    />
  </svg>
)

export default SvgDollar
