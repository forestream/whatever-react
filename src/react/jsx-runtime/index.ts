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
	const getStates = () => states;
	const getStateIndex = () => stateIndex;
	const setStateIndex = (nextStateIndex: number) =>
		(stateIndex = nextStateIndex);

	function render(reactElement: ReactElement) {
		stateIndex = 0;
		if (!initRenderComponent.length) {
			initRenderComponent.push(reactElement);
		}
		virtualDOM.render(reactElement);
	}

	function rerender() {
		stateIndex = 0;
		virtualDOM.rerender();
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

	type Initializer<T> = T extends any ? T | ((prevState: T) => T) : never;

	function useState<T>(
		initState: Initializer<T>
	): [T, (nextState: Initializer<T>) => void] {
		const currentIndex = stateIndex++;

		if (states.length < currentIndex + 1) {
			states.push(typeof initState === "function" ? initState() : initState);
		}

		function setState(nextState: Initializer<T>) {
			const currentState = states[currentIndex];

			const returnedNextState =
				typeof nextState === "function" ? nextState(currentState) : nextState;

			if (currentState === returnedNextState) return;

			states[currentIndex] = returnedNextState;

			rerender();
		}

		return [states[currentIndex], setState];
	}

	return {
		useState,
		createRoot,
		createElement,
		getStateIndex,
		setStateIndex,
		getStates,
	};
})();

export const {
	useState,
	createRoot,
	createElement,
	getStateIndex,
	setStateIndex,
	getStates,
} = React;
export default React;
