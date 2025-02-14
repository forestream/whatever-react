import {
	Children,
	PropsWithChildren,
	PropsWithoutChildren,
	ReactElement,
	ReactElementType,
	VirtualDOM,
} from "../types";

export type CleanupFuntion = () => void;
export type EffectCallback = () => void | CleanupFuntion;
export type DependencyList = any[] | undefined;
export type DependencyUpdated = boolean;

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

	const effects: [
		EffectCallback,
		DependencyList,
		DependencyUpdated,
		CleanupFuntion | void
	][] = [];
	let effectIndex = 0;
	const getEffects = () => effects;
	const getEffectIndex = () => effectIndex;
	const setEffectIndex = (nextEffectIndex: number) =>
		(effectIndex = nextEffectIndex);

	function render(reactElement: ReactElement) {
		stateIndex = 0;
		effectIndex = 0;
		virtualDOM.initializeVirtualDOM(reactElement);
	}

	function rerender() {
		stateIndex = 0;
		effectIndex = 0;
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

	function Fragment({ children }: PropsWithChildren) {
		return children;
	}

	type Initializer<T> = T extends unknown ? T | ((prevState: T) => T) : never;

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

	function useEffect(
		callback: () => void | (() => void),
		deps?: unknown[]
	): void {
		const currentIndex = effectIndex++;

		const updateCleanupAfterEffect = () => {
			effects[currentIndex][3] = callback();
		};

		if (effects.length < currentIndex + 1) {
			effects.push([updateCleanupAfterEffect, deps, true, undefined]);
			return;
		}

		effects[currentIndex][2] = false;

		const [_prevCallback, prevDeps] = effects[currentIndex];

		if (
			prevDeps === undefined ||
			deps === undefined ||
			prevDeps.some((prevDep, i) => prevDep !== deps[i])
		) {
			[
				effects[currentIndex][0],
				effects[currentIndex][1],
				effects[currentIndex][2],
			] = [updateCleanupAfterEffect, deps, true];
		}
	}

	return {
		useState,
		useEffect,
		createRoot,
		createElement,
		getStateIndex,
		setStateIndex,
		getStates,
		getStateUpdated,
		setStateUpdated,
		rerender,
		getEffectIndex,
		setEffectIndex,
		getEffects,
		Fragment,
	};
})();

export const {
	useState,
	useEffect,
	createRoot,
	createElement,
	getStateIndex,
	setStateIndex,
	getStates,
	getStateUpdated,
	setStateUpdated,
	rerender,
	getEffectIndex,
	setEffectIndex,
	getEffects,
	Fragment,
} = React;
export default React;
