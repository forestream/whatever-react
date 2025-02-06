import {
	Children,
	PropsWithoutChildren,
	ReactElement,
	ReactElementType,
} from "../types";

export function createElement(
	type: ReactElementType,
	props: PropsWithoutChildren,
	...children: Children
): ReactElement {
	return {
		type,
		props,
		children: children.flat(Infinity),
	};
}

const React = { createElement };

export default React;
