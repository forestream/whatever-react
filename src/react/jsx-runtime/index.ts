import {
	Children,
	PropsWithoutChildren,
	ReactElement,
	ReactElementType,
	VirtualDOM,
} from "../types";

const React = (function () {
	const virtualDOM = new VirtualDOM();

	function createElement(
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

	return {
		createElement,
		createRoot: virtualDOM.createRoot.bind(virtualDOM),
		render: virtualDOM.render.bind(virtualDOM),
	};
})();

export const { createRoot, render, createElement } = React;
export default React;
