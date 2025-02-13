import {
	Children,
	PropsWithoutChildren,
	ReactElement,
	ReactElementType,
	VirtualDOM,
} from "../types";

const React = (function () {
	const virtualDOM = new VirtualDOM();

	const states: any[] = [];
	let stateIndex = 0;
	const getStates = () => states;
	const getStateIndex = () => stateIndex;
	const setStateIndex = (nextStateIndex: number) =>
		(stateIndex = nextStateIndex);

	let stateUpdated = false;
	const getStateUpdated = () => stateUpdated;
	const setStateUpdated = (value: boolean) => (stateUpdated = value);

	function render(reactElement: ReactElement) {
		stateIndex = 0;
		virtualDOM.initializeVirtualDOM(reactElement);
	}

	function rerender() {
		stateIndex = 0;
		setStateUpdated(false);
		virtualDOM.updateVirtualDOM();
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

			setStateUpdated(true);
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
		getStateUpdated,
		setStateUpdated,
		rerender,
	};
})();

export const {
	useState,
	createRoot,
	createElement,
	getStateIndex,
	setStateIndex,
	getStates,
	getStateUpdated,
	setStateUpdated,
	rerender,
} = React;
export default React;
