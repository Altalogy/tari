import * as React from "react";
import { SVGProps } from "react";

const SvgDiscovery = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M3.353 8.95A7.511 7.511 0 0 1 8.95 3.353c2.006-.47 4.094-.47 6.1 0a7.511 7.511 0 0 1 5.597 5.597c.47 2.006.47 4.094 0 6.1a7.511 7.511 0 0 1-5.597 5.597c-2.006.47-4.094.47-6.1 0a7.511 7.511 0 0 1-5.597-5.597 13.354 13.354 0 0 1 0-6.1Z"
      stroke="currentColor"
      strokeWidth={1.5}
    />
    <path
      d="M10.182 11.295a2 2 0 0 1 1.114-1.114l2.038-.815c.816-.326 1.627.484 1.3 1.3l-.815 2.038a2 2 0 0 1-1.114 1.114l-2.038.815c-.816.327-1.626-.484-1.3-1.3l.815-2.038Z"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default SvgDiscovery;
