import { HTML_ELEMENT_TAG_NAMES } from "@/constants";
import {
	getStateUpdated,
	getStateIndex,
	getStates,
	rerender,
	setStateIndex,
	setStateUpdated,
	getEffectIndex,
	getEffects,
	EffectCallback,
	DependencyList,
	CleanupFuntion,
	DependencyUpdated,
	setEffectIndex,
	setStates,
	setEffects,
} from "@/react/jsx-runtime";
import { hasSetter } from "@/utils/hasSetter";

export type Child = string | ReactElement;
export type Children = Child[];
export type PropsWithoutChildren<Props = {}> =
	| (Omit<Record<string, unknown>, "children"> & Props)
	| null;
export type PropsWithChildren<Props = {}> = PropsWithoutChildren<Props> & {
	children?: Children;
};

export type Component = (props: PropsWithChildren) => ReactElement;

export type ReactElementType = Component | keyof HTMLElementTagNameMap;

export type ReactElement = {
	type: ReactElementType;
	props: PropsWithoutChildren;
	children?: Children;
};

export type ReactFragmentArray = Child[];
export type ReactFragment = () => ReactFragmentArray;

export class SyntheticEvent<Target = unknown> {
	preventDefault: () => void;
	nativeEvent: (Event & { target: Target }) | Event;
	target: Target extends EventTarget ? Target : null;

	constructor(e: Event) {
		this.target = e.target as Target extends EventTarget ? Target : null;
		this.preventDefault = () => {};

		for (const key in e) {
			this[key] = typeof e[key] === "function" ? e[key].bind(e) : e[key];
		}

		this.nativeEvent = e;
	}
}

export type SyntheticEventHandler = (e?: SyntheticEvent) => void;

export type VirtualNodeContent =
	| HTMLElement
	| ReactElement
	| ReactFragmentArray
	| string
	| boolean
	| number
	| object;

export class VirtualNode {
	type?: "root" | "htmlElement" | "component" | "primitive" | "fragmentArray";
	name?: Component["name"] | keyof HTMLElementTagNameMap | "FragmentArray";
	props?: PropsWithoutChildren;
	/**
	 * @todo ReactElement.children 프로퍼티와 VirtualNode.children 프로퍼티의 타입은 다릅니다. 수정 필요
	 */
	children: VirtualNode[];
	parentNode?: VirtualNode;
	content: VirtualNodeContent;
	component?: Component;
	states: unknown[];
	startStateIndex?: number;
	endStateIndex?: number;
	eventHandlerCleanups: (() => void)[];
	isStale: boolean;
	effects: [
		EffectCallback,
		DependencyList,
		DependencyUpdated,
		CleanupFuntion | void
	][];
	startEffectIndex?: number;
	endEffectIndex?: number;
	effectCleanups: (CleanupFuntion | void)[];
	key?: string;
	shouldRender: boolean;

	constructor(content: VirtualNodeContent) {
		this.content = content;
		this.children = [];
		this.eventHandlerCleanups = [];
		this.isStale = false;
		this.effects = [];
		this.states = [];
		this.effectCleanups = [];
		this.shouldRender = false;

		// 원시값이나 함수일 때
		if (typeof content !== "object") {
			this.type = "primitive";
			return;
		}

		// Fragment일 때
		/**
		 * React.Fragment는 컴포넌트, React.Fragment가 반환하는 배열이 fragment 타입으로 만들어집니다.
		 * @todo 위 사항 수정 필요
		 */
		if (Array.isArray(content)) {
			this.type = "fragmentArray";
			this.name = "FragmentArray";
			return;
		}

		// 루트 노드를 생성할 때
		if (content instanceof HTMLElement) {
			this.type = "root";
			this.name = content.localName;
			return;
		}

		// type이 컴포넌트일 때
		if (typeof (content as ReactElement).type === "function") {
			this.key = (content as ReactElement).props?.key as string;
			this.type = "component";
			this.name = ((content as ReactElement).type as Function).name;
			this.component = (content as ReactElement).type as Component;
			this.props = (content as ReactElement).props;
			return;
		}

		// type이 HTML tag name일 때
		if (((content as ReactElement).type as string) in HTML_ELEMENT_TAG_NAMES) {
			this.key = (content as ReactElement).props?.key as string;
			this.type = "htmlElement";
			this.name = (content as ReactElement).type as string;
			this.props = (content as ReactElement).props;
		}
	}

	appendChild(node: VirtualNode) {
		if (this.type === "primitive") {
			throw new Error(
				"primitive 타입 노드에는 자식 노드를 추가할 수 없습니다."
			);
		}
		node.parentNode = this;
		this.children.push(node);
		return node;
	}

	replaceChild(oldNode: VirtualNode, newNode: VirtualNode) {
		const targetIndex = this.children.indexOf(oldNode);
		this.children[targetIndex] = newNode;
		oldNode.parentNode = undefined;
		newNode.parentNode = this;
	}

	// shallow copy
	cloneNode() {
		const clone = new VirtualNode(this.content);
		Object.keys(clone).forEach((key) => {
			if (key === "content") return;
			clone[key] = this[key];
		});
		return clone;
	}

	/**
	 * @todo 이전과 같은 핸들러일 경우 생략할 필요가 있어 보임
	 */
	attachEventHandlersToDOM(target: Node, rerender: () => void) {
		Object.entries(this.props ?? {}).forEach(([handlerName, handler]) => {
			if (!handlerName.startsWith("on")) return;

			if (!handler) return;

			const lowercaseHandlerName = handlerName.toLowerCase();
			const lowercaseEventName = lowercaseHandlerName.slice(2);

			const realNodeEventHandler = (e?: Event) => {
				if (
					e instanceof InputEvent &&
					lowercaseEventName === "change" &&
					this.props?.value ===
						(e.target as HTMLInputElement | HTMLTextAreaElement).value
				) {
					return;
				}

				(handler as SyntheticEventHandler)(e && new SyntheticEvent(e));
				if (getStateUpdated()) rerender();
			};

			target.addEventListener(
				lowercaseEventName === "change" ? "input" : lowercaseEventName,
				realNodeEventHandler
			);

			this.eventHandlerCleanups.push(() => {
				target.removeEventListener(
					lowercaseEventName === "change" ? "input" : lowercaseEventName,
					realNodeEventHandler
				);
			});
		});
	}

	// todo: 재귀가 필요한지 고민해보기
	callEventHandlerCleanups() {
		let currentNode: VirtualNode = this;

		(function traverse() {
			while (currentNode.eventHandlerCleanups.length) {
				currentNode.eventHandlerCleanups.shift()!();
			}

			currentNode.children.forEach((child) => {
				currentNode = child;
				traverse();
			});
		})();
	}

	callEffectCleanups() {
		while (this.effectCleanups && this.effectCleanups.length) {
			const cleanup = this.effectCleanups.shift();
			typeof cleanup === "function" && cleanup();
		}
	}

	// 각 가상노드의 effectCleanups 배열도 순회하며 각 컴포넌트마다 useEffect 클린업 함수 실행 (리프노드부터 후위 순회)
	batchCleanups(this: VirtualNode) {
		(function traverse(virtualNode) {
			let currentNode = virtualNode;

			if (currentNode.children) {
				currentNode.children.forEach((child) => {
					currentNode = child;
					traverse(currentNode);
				});
			}

			virtualNode.effects.forEach(
				(effect) => effect[2] && typeof effect[3] === "function" && effect[3]()
			);
		})(this);
	}

	renderComponent() {
		if (this.type !== "component") {
			throw new Error(
				"renderComponent 메서드는 컴포넌트 노드에서만 호출할 수 있습니다."
			);
		}

		setStateUpdated(false);

		/**
		 * 함수 컴포넌트를 실행하기 전과 후 사이의 states, effects 훅 배열을 복사하여
		 * virtualNode.states에 저장.
		 */
		const startStateIndex = getStateIndex();
		const startEffectIndex = getEffectIndex();

		/**
		 * startStateIndex가 undefined일 때는 마운트 단계임을 의미합니다.
		 * 현재 훅 인덱스에 새로운 상태가 삽입되도록 현재 인덱스 뒷 부분의 요소들을 잘라냈다가
		 * 렌더링 후 다시 붙입니다.
		 * @todo any 수정
		 */
		let effectsAfter: any[] = [];
		let statesAfter: any[] = [];
		if (this.startStateIndex === undefined) {
			statesAfter = getStates().slice(startStateIndex);
			effectsAfter = getEffects().slice(startEffectIndex);
			setStates((prev) => prev.slice(0, startStateIndex));
			setEffects((prev) => prev.slice(0, startEffectIndex));
		} else {
			setStates((prev) => [
				...prev.slice(0, startStateIndex),
				...this.states,
				...prev.slice(startStateIndex + this.states.length),
			]);

			setEffects((prev) => [
				...prev.slice(0, startEffectIndex),
				...this.effects,
				...prev.slice(startEffectIndex + this.effects.length),
			]);
		}

		const { props, children } = this.content as ReactElement;

		const nextChildren = new VirtualNode(
			this.component!({ ...props, children })
		);

		if (getStateUpdated()) this.isStale = true;

		const endStateIndex = getStateIndex();
		const endEffectIndex = getEffectIndex();

		this.startStateIndex = startStateIndex;
		this.startEffectIndex = startEffectIndex;
		this.endStateIndex = endStateIndex;
		this.endEffectIndex = endEffectIndex;
		this.states = getStates().slice(this.startStateIndex, this.endStateIndex);
		this.effects = getEffects().slice(
			this.startEffectIndex,
			this.endEffectIndex
		);

		setStates((prev) => [...prev, ...statesAfter]);
		setEffects((prev) => [...prev, ...effectsAfter]);

		return nextChildren;
	}

	unmountComponent() {
		this.parentNode = undefined;

		const stateIndices: number[][] = [];
		const effectIndices: number[][] = [];

		(function traverse(currentNode: VirtualNode) {
			if (currentNode.type === "component") {
				const {
					startEffectIndex,
					endEffectIndex,
					startStateIndex,
					endStateIndex,
				} = currentNode;

				stateIndices.push([startStateIndex!, endStateIndex!]);
				effectIndices.push([startEffectIndex!, endEffectIndex!]);
			}

			currentNode.children.forEach((child) => {
				traverse(child);
			});
		})(this);

		while (stateIndices.length) {
			const [start, end] = stateIndices.pop() as number[];
			setStates((prev) => [...prev.slice(0, start), ...prev.slice(end)]);
		}

		while (effectIndices.length) {
			const [start, end] = effectIndices.pop() as number[];
			setEffects((prev) => [...prev.slice(0, start), ...prev.slice(end)]);
		}

		this.callEventHandlerCleanups();
		this.batchCleanups();
	}

	updateChildren(nextChildren: VirtualNode[]) {
		const currentNode = this;
		let currentChildren = currentNode.children;

		nextChildren.forEach((nextChild) => {
			let correspondingCurrentChild: VirtualNode | undefined;

			currentChildren = currentChildren.filter((currentChild) => {
				const isSame =
					currentChild.name === nextChild.name &&
					currentChild.key === nextChild.key;

				if (isSame) correspondingCurrentChild = currentChild;

				return !isSame;
			});

			if (correspondingCurrentChild) {
				const {
					states,
					effects,
					children,
					startStateIndex,
					endStateIndex,
					startEffectIndex,
					endEffectIndex,
				} = correspondingCurrentChild;

				nextChild.states = states;
				nextChild.effects = effects;
				nextChild.children = children;
				nextChild.startStateIndex = startStateIndex;
				nextChild.endStateIndex = endStateIndex;
				nextChild.startEffectIndex = startEffectIndex;
				nextChild.endEffectIndex = endEffectIndex;

				correspondingCurrentChild.callEventHandlerCleanups();
			}
		});

		currentChildren.forEach((child) => child.unmountComponent());

		currentNode.children = nextChildren;
	}
}

export class VirtualDOM {
	realRoot: null | HTMLElement;
	root: null | VirtualNode;

	constructor() {
		this.root = null;
		this.realRoot = null;
	}

	createRoot(htmlElement: HTMLElement) {
		this.realRoot = htmlElement;
		this.root = new VirtualNode(htmlElement.cloneNode() as HTMLElement);
		return this;
	}

	/**
	 * 전달받은 가상노드를 루트로 하는 트리를 생성해서 반환합니다.
	 * @param virtualNode
	 * @param batchCleanups
	 * @returns
	 */
	static generateVirtualDOMTree(virtualNode: VirtualNode) {
		const effects: [
			EffectCallback,
			DependencyList,
			DependencyUpdated,
			CleanupFuntion | void
		][] = [];

		let currentNode = virtualNode;

		(function traverse() {
			if (currentNode.type === "primitive") {
				// 노드값이 원시값일 때 동작 없음 = currentNode에 append할 children이 없음
			}

			if (currentNode.type === "fragmentArray") {
				(currentNode.content as ReactFragmentArray).forEach((child) => {
					if (
						typeof child === "boolean" ||
						typeof child === "undefined" ||
						Object.is(null, child)
					)
						return;

					currentNode.appendChild(new VirtualNode(child));
				});
			}

			if (currentNode.type === "htmlElement") {
				(currentNode.content as ReactElement).children?.forEach((child) => {
					if (
						typeof child === "boolean" ||
						typeof child === "undefined" ||
						Object.is(null, child)
					)
						return;

					currentNode.appendChild(new VirtualNode(child));
				});
			}

			if (currentNode.type === "component") {
				const childNode = currentNode.renderComponent();

				currentNode.appendChild(childNode);
			}

			const currentNodeStoredForEffects = currentNode;

			if (currentNode.children.length) {
				currentNode.children.forEach((child) => {
					/**
					 * currentNode가 stale하다면(컴포넌트 내부 상태가 업데이트 되었다면)
					 * 반환할 newTree.isStale도 true로 설정하고 가상 트리 형성을 멈춘다.
					 * forEach 내부 상단에 있어야 이미 실행 중인 forEach 콜백함수도 얼리 리턴 할 수 있음.
					 */
					if (currentNode.isStale) {
						virtualNode.isStale = true;
						return;
					}
					currentNode = child;
					traverse();
				});
			}

			currentNodeStoredForEffects.effects.forEach((effect) => {
				effect[2] && effects.push(effect);
			});
		})();

		return { node: virtualNode, effects };
	}

	/**
	 * tagName이 다르면 가상 노드를 기반으로 요소를 새로 생성 후 실제 노드와 교체한다.
	 * attribute만 다르면 실제 노드를 유지하고 attribute만 수정한다.
	 * 가상 노드가 텍스트 노드일 때는 실제 텍스트 노드를 수정한다.
	 * @param virtualNode 리렌더링 된 가상 노드
	 * @param node 현재 브라우저 화면에 존재하는 실제 노드
	 */
	static compare(
		virtualNode: VirtualNode,
		realNode: Node,
		rerender: () => void
	): Node {
		if (virtualNode.type === "primitive") {
			if (String(virtualNode.content) !== realNode.textContent) {
				realNode.textContent = virtualNode.content as string;
			}

			return realNode;
		}

		if (virtualNode.name !== realNode.nodeName.toLowerCase()) {
			const newElement = document.createElement(virtualNode.name!);

			virtualNode.callEventHandlerCleanups();
			virtualNode.attachEventHandlersToDOM(newElement, rerender);

			Object.entries((virtualNode.content as ReactElement).props ?? {}).forEach(
				([key, value]) => {
					if (key.startsWith("on")) return;

					if (key === "value") {
						(newElement as Element).setAttribute(key, value as string);
					}

					if (hasSetter(newElement, key)) newElement[key] = value;
				}
			);

			realNode.parentNode &&
				realNode.parentNode.replaceChild(newElement, realNode);

			return newElement;
		}

		virtualNode.callEventHandlerCleanups();
		virtualNode.attachEventHandlersToDOM(realNode, rerender);

		Object.entries((virtualNode.content as ReactElement).props ?? {}).forEach(
			([key, value]) => {
				if (key.startsWith("on")) return;

				if (key === "value") {
					(realNode as Element).setAttribute(key, value as string);
				}

				if (hasSetter(realNode, key)) realNode[key] = value;
			}
		);

		return realNode;
	}

	realizeVirtualDOM() {
		let currentVirtualNode = this.root!;
		let currentRealNode: Node = this.realRoot!;
		const updateVirtualDOM = () => this.updateVirtualDOM();

		(function traverse(initIndex?: number) {
			/**
			 * 리렌더링 할 때 해당 인덱스에 노드(HTMLElement)가 이미 있다면 노드를 새로 생성하지 않고 해당 노드를 수정
			 */
			let realChildNodeIndex = initIndex ?? 0;

			if (currentVirtualNode.children) {
				currentVirtualNode.children.forEach((virtualChild) => {
					const realChild = currentRealNode.childNodes.item(realChildNodeIndex);

					if (virtualChild.type === "component") {
						/**
						 * 가상 노드 child가 컴포넌트라면 실제 DOM 노드는 생성하지 않는다.
						 */
					}

					if (virtualChild.type === "fragmentArray") {
						/**
						 * 가상 노드 child가 프래그먼트라면 실제 DOM 노드는 생성하지 않는다.
						 */
					}

					/**
					 * todo: HTMLInputElement에 'input' 이벤트가 발생할 때마다
					 * 리렌더링하면서 포커스를 잃어버리는 문제 해결 방안
					 * - input.value = 'foo'; 형식의 코드가 실행되면 포커스가 해제되지 않는다.
					 * input 요소 자체를 리렌더링하지 않고 기존 요소의 어트리뷰트만 업데이트 하는 방법을 생각해봐야 함.
					 * setAttribute는 HTML attriute의 값은 바꾸지만 실제 입력 필드의 값을 바꾸지는 못함.
					 */
					if (virtualChild.type === "htmlElement") {
						if (realChild) {
							currentRealNode = VirtualDOM.compare(
								virtualChild,
								realChild,
								updateVirtualDOM
							);
						} else {
							const newElement = document.createElement(virtualChild.name!);

							virtualChild.callEventHandlerCleanups();
							virtualChild.attachEventHandlersToDOM(
								newElement,
								updateVirtualDOM
							);

							Object.entries(
								(virtualChild.content as ReactElement).props ?? {}
							).forEach(([key, value]) => {
								if (key.startsWith("on")) return;

								if (key === "value") {
									(newElement as Element).setAttribute(key, value as string);
								}

								if (hasSetter(newElement, key)) newElement[key] = value;
							});

							currentRealNode = currentRealNode.appendChild(newElement);
						}
					}

					if (virtualChild.type === "primitive") {
						if (realChild) {
							currentRealNode = VirtualDOM.compare(
								virtualChild,
								realChild,
								updateVirtualDOM
							);
						} else {
							currentRealNode = currentRealNode.appendChild(
								document.createTextNode(virtualChild.content as string)
							);
						}
					}

					currentVirtualNode = virtualChild;
					realChildNodeIndex =
						currentVirtualNode.type === "component" ||
						currentVirtualNode.type === "fragmentArray"
							? traverse(realChildNodeIndex)
							: realChildNodeIndex + traverse();

					/**
					 * traverse 종료 후 부모 노드로 복귀
					 * currentRealNode의 이동 여부 때문에 필요함
					 */
					currentVirtualNode =
						currentVirtualNode.parentNode ?? currentVirtualNode;
				});
			}

			// 가상노드의 자녀 노드 순회를 마쳤는데 실제 노드에 다음 자녀노드가 있다면 해당 노드들을 모두 제거한다.
			if (
				currentVirtualNode.type !== "component" &&
				currentVirtualNode.type !== "fragmentArray"
			) {
				while (currentRealNode.childNodes.item(realChildNodeIndex)) {
					currentRealNode.childNodes.item(realChildNodeIndex).remove();
				}
			}

			// currentVirtualNode가 컴포넌트라면 currentRealNode는 부모 노드로 이동하지 않음
			if (
				currentVirtualNode.type === "component" ||
				currentVirtualNode.type === "fragmentArray"
			)
				return realChildNodeIndex;

			currentRealNode = currentRealNode.parentNode ?? currentRealNode;

			return 1;
		})();
	}

	// todo: VirtualNode를 전달받도록 수정
	initializeVirtualDOM(reactElement: ReactElement) {
		if (!this.root) {
			throw new Error(
				"루트 노드가 존재해야 합니다. createRoot()를 호출하여 루트 노드를 생성하세요."
			);
		}

		const { node: newTree, effects } = VirtualDOM.generateVirtualDOMTree(
			new VirtualNode(reactElement)
		);

		this.root.appendChild(newTree);

		this.realizeVirtualDOM();

		while (effects.length) {
			const effect = effects.shift();
			if (!effect) continue;
			typeof effect[0] === "function" && effect[0]();
		}

		if (newTree.isStale) {
			rerender();
			return;
		}
	}

	/**
	 * 현재 트리와 새로운 트리를 비교 후 실제 DOM 교체
	 */
	updateVirtualDOM() {
		this.updateComponentStates();

		setStateIndex(0);

		let currentNode = this.root!;
		let effects: [
			EffectCallback,
			DependencyList,
			boolean,
			void | CleanupFuntion
		][] = [];
		let updatedComponent: VirtualNode | null = null;

		(function traverse(this: VirtualDOM) {
			if (currentNode.shouldRender) {
				if (currentNode.type === "fragmentArray") {
					const nextChildren: VirtualNode[] = [];

					(currentNode.content as ReactFragmentArray).forEach((content) => {
						const newNode = new VirtualNode(content);
						if (
							typeof newNode.content === "boolean" ||
							typeof newNode.content === "undefined" ||
							Object.is(null, newNode.content)
						)
							return;

						newNode.shouldRender = true;
						newNode.parentNode = currentNode;
						nextChildren.push(newNode);
					});

					currentNode.updateChildren(nextChildren);
				}

				if (currentNode.type === "htmlElement") {
					const nextChildren: VirtualNode[] = [];

					(currentNode.content as ReactElement).children?.forEach((child) => {
						const newNode = new VirtualNode(child);
						if (
							typeof newNode.content === "boolean" ||
							typeof newNode.content === "undefined" ||
							Object.is(null, newNode.content)
						)
							return;

						newNode.shouldRender = true;
						newNode.parentNode = currentNode;
						nextChildren.push(newNode);
					});

					currentNode.updateChildren(nextChildren);
				}

				if (currentNode.type === "component") {
					const nextChildren: VirtualNode[] = [];

					const newNode = currentNode.renderComponent();
					newNode.shouldRender = true;
					newNode.parentNode = currentNode;
					nextChildren.push(newNode);

					currentNode.updateChildren(nextChildren);
				}

				currentNode.shouldRender = false;
			}

			if (currentNode.type === "component") {
				setStateIndex(currentNode.endStateIndex!);
				setEffectIndex(currentNode.endEffectIndex!);
			}

			if (currentNode.isStale) {
				rerender();
				return;
			}

			if (currentNode.children.length) {
				currentNode.children.forEach((child) => {
					if (currentNode.isStale) return;

					currentNode = child;
					traverse.call(this);
				});
			}
		}).call(this);

		this.realizeVirtualDOM();

		updatedComponent && (updatedComponent as VirtualNode).batchCleanups();

		while (effects.length) {
			const effect = effects.shift();
			if (!effect) continue;
			typeof effect[0] === "function" && effect[0]();
		}
	}

	updateComponentStates() {
		(function traverse(currentNode: VirtualNode) {
			if (currentNode.type === "component") {
				const prevStates = currentNode.states;
				const { startStateIndex, endStateIndex } = currentNode;
				const currentStates = getStates().slice(startStateIndex, endStateIndex);
				currentNode.states = currentStates;

				// 컴포넌트의 상태가 업데이트 되었다면
				if (
					currentNode.isStale ||
					prevStates?.some((prevState, i) => prevState !== currentStates[i])
				) {
					currentNode.shouldRender = true;
				}
			}

			currentNode.children.forEach((child) => {
				traverse(child);
			});
		})(this.root!);
	}
}
