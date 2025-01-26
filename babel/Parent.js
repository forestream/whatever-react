import Child from "./Child";
import React from "./react";
export default function Parent() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", null, "This is parent comp"), /*#__PURE__*/React.createElement(Child, null));
}