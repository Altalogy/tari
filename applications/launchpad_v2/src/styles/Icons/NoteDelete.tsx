import * as React from 'react'
import { SVGProps } from 'react'

const SvgNoteDelete = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width='1em'
    height='1em'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    data-testid='svg-notedelete'
    {...props}
  >
    <path
      d='m3.833 15.248.731-.167-.73.168Zm0-5.895.731.168-.73-.168Zm16.334 0-.731.168.73-.168Zm0 5.896-.731-.168.73.168Zm-5.287 5.41.175.73-.175-.73Zm-5.76 0 .175-.73-.175.73Zm0-16.716.175.73-.175-.73Zm5.76 0 .175-.73-.175.73ZM8.82 3a.75.75 0 0 0-1.5 0h1.5Zm-1.5 2.514a.75.75 0 0 0 1.5 0h-1.5ZM16.68 3a.75.75 0 0 0-1.5 0h1.5Zm-1.5 2.514a.75.75 0 0 0 1.5 0h-1.5ZM4.564 15.08a12.452 12.452 0 0 1 0-5.56l-1.462-.335a13.952 13.952 0 0 0 0 6.23l1.462-.335Zm14.872-5.56c.419 1.828.419 3.731 0 5.56l1.462.335c.47-2.049.47-4.181 0-6.23l-1.462.335Zm-4.73 10.409a11.58 11.58 0 0 1-5.411 0l-.35 1.458a13.08 13.08 0 0 0 6.11 0l-.35-1.458ZM9.294 4.672c1.78-.427 3.63-.427 5.41 0l.35-1.458a13.08 13.08 0 0 0-6.11 0l.35 1.458Zm0 15.258c-2.339-.562-4.177-2.435-4.73-4.85l-1.463.336c.677 2.955 2.935 5.274 5.843 5.972l.35-1.458Zm5.76 1.458c2.908-.698 5.166-3.017 5.843-5.972l-1.462-.335c-.554 2.414-2.392 4.287-4.73 4.849l.35 1.458Zm-.35-16.716c2.339.562 4.177 2.434 4.73 4.849l1.463-.335c-.677-2.955-2.935-5.275-5.843-5.972l-.35 1.458Zm-5.76-1.458C6.037 3.91 3.779 6.23 3.102 9.186l1.462.335c.554-2.415 2.392-4.287 4.73-4.849l-.35-1.458ZM7.32 3v2.514h1.5V3h-1.5Zm7.86 0v2.514h1.5V3h-1.5Z'
      fill='currentColor'
    />
    <path
      d='m13.415 11.586-2.829 2.828m2.829 0-2.829-2.828'
      stroke='currentColor'
      strokeWidth={1.5}
      strokeLinecap='round'
    />
  </svg>
)

export default SvgNoteDelete
