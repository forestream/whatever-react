import {
	Children,
	PropsWithoutChildren,
	ReactElement,
	ReactElementType,
	VirtualDOM,
} from "../types";

const React = (function () {
	const virtualDOM = new VirtualDOM();
	let initRenderComponent: ReactElement[] = [];

	const states: any[] = [];
	let stateIndex = 0;

	function render(reactElement: ReactElement) {
		stateIndex = 0;
		if (!initRenderComponent.length) {
			initRenderComponent.push(reactElement);
		}
		virtualDOM.render(reactElement);
	}

	function createRoot(root: HTMLElement) {
		virtualDOM.createRoot(root);
		return { render };
	}

	function createElement(
		type: ReactElementType,
		props: PropsWithoutChildren,
		...children: Children
	): ReactElement {
		return {
			type,
			props,
			children: children.length === 0 ? undefined : children.flat(Infinity),
		};
	}

	function useState<T>(initState: T): [T, (newState: T) => void] {
		const currentIndex = stateIndex++;

		// 초기 렌더링 시에 states[stateIndex]에 값이 없으므로 initState를 push합니다.
		if (states.length < currentIndex + 1) {
			states.push(initState);
		}

		function setState(newState: T) {
			states[currentIndex] = newState;
			render(initRenderComponent[0]);
		}

		return [states[currentIndex], setState];
	}

	return {
		useState,
		createElement,
		createRoot,
	};
})();

export const { useState, createRoot, createElement } = React;
export default React;
