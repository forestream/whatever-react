import Child from "./Child";
import React from "./react";

export default function Parent({ children, ...props }) {
	return <Child>{children}</Child>;
}
