import Child from "./Child";
import React from "./react";
export default function Parent({
  children,
  ...props
}) {
  return /*#__PURE__*/React.createElement(Child, null, children);
}