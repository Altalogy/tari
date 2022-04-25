import * as React from 'react'
import { SVGProps } from 'react'

const SvgSend = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width='1em'
    height='1em'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    data-testid='svg-send'
    {...props}
  >
    <path
      d='m8.11 4.33.354-.662-.353.661Zm9.325 4.979-.354.661.354-.661Zm-.004 5.406.352.662-.352-.662Zm-9.319 4.958-.352-.662.352.662Zm-3.965-3.627-.719-.216.719.216ZM4.14 7.951l-.719.215.719-.215Zm4.189 4.815a.75.75 0 1 0 0-1.5v1.5ZM7.758 4.99l9.323 4.98.707-1.324-9.324-4.98-.706 1.324Zm9.32 9.062L7.76 19.01l.704 1.324 9.32-4.958-.705-1.324ZM4.866 16.262l1.212-4.03L4.64 11.8l-1.212 4.03 1.437.432Zm1.212-4.461L4.859 7.736l-1.437.43 1.218 4.065 1.437-.43Zm-.718.965h2.97v-1.5H5.36v1.5Zm2.4 6.245c-.808.43-1.652.248-2.253-.302-.606-.554-.937-1.465-.641-2.447l-1.437-.432c-.47 1.565.059 3.065 1.066 3.986 1.012.925 2.535 1.283 3.97.52L7.76 19.01Zm9.322-9.04c1.56.832 1.558 3.252-.002 4.082l.704 1.324c2.62-1.394 2.623-5.332.005-6.73l-.707 1.323ZM8.464 3.667C7.03 2.9 5.506 3.256 4.493 4.18c-1.009.92-1.54 2.42-1.07 3.985l1.436-.43c-.294-.983.038-1.894.645-2.447.601-.549 1.445-.73 2.254-.298l.706-1.323Z'
      fill='currentColor'
    />
  </svg>
)

export default SvgSend
