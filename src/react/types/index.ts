import { HTML_ELEMENT_TAG_NAMES } from "@/constants";
import { getStateIndex, getStates, setStateIndex } from "@/react/jsx-runtime";
import { hasSetter } from "@/utils/hasSetter";

export type Child = string | ReactElement;
export type Children = Child[];
export type PropsWithoutChildren = Omit<
	Record<string, unknown>,
	"children"
> | null;
export type PropsWithChildren = PropsWithoutChildren & { children?: Children };

export type Component = (props: PropsWithChildren) => ReactElement;

export type ReactElementType = Component | keyof HTMLElementTagNameMap;

export type ReactElement = {
	type: ReactElementType;
	props: PropsWithoutChildren;
	children?: Children;
};

export class VirtualNode {
	type?: "root" | "htmlElement" | "component" | "primitive";
	name?: Component["name"] | keyof HTMLElementTagNameMap;
	props?: PropsWithoutChildren;
	children: VirtualNode[];
	parentNode?: VirtualNode;
	content: HTMLElement | ReactElement | string;
	component?: Component;
	onClick?: (e: MouseEvent) => void;
	onChange?: (e: Event) => void;
	states?: unknown[];
	startStateIndex?: number;
	endStateIndex?: number;

	constructor(node: HTMLElement | ReactElement | string) {
		this.content = node;
		this.children = [];

		// 원시값이나 함수일 때
		if (typeof node !== "object") {
			this.type = "primitive";
			this.content = node;
			return;
		}

		// 루트 노드를 생성할 때
		if (node instanceof HTMLElement) {
			this.type = "root";
			this.name = node.localName;
			return;
		}

		// type이 컴포넌트일 때
		if (typeof node.type === "function") {
			this.type = "component";
			this.name = node.type.name;
			this.component = node.type;
			this.props = node.props;
			return;
		}

		// type이 HTML tag name일 때
		if (node.type in HTML_ELEMENT_TAG_NAMES) {
			this.type = "htmlElement";
			this.name = node.type;
			this.props = node.props;
			this.onChange = node.props?.onChange as (e: Event) => void;
			this.onClick = node.props?.onClick as (e: MouseEvent) => void;
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

	static generateVirtualDOMTree(reactElement: ReactElement) {
		/**
		 * 기존 트리를 변경하지 않도록 새로운 VirtualNode를 생성해서 반환합니다.
		 */
		const newTree = new VirtualNode(reactElement);
		let currentNode = newTree;

		(function traverse() {
			if (currentNode.type === "primitive") {
				// 노드값이 원시값일 때 동작 없음 = currentNode에 append할 children이 없음
			}

			if (currentNode.type === "htmlElement") {
				(currentNode.content as ReactElement).children?.forEach((child) =>
					currentNode.appendChild(new VirtualNode(child))
				);
			}

			if (currentNode.type === "component") {
				const { props, children } = currentNode.content as ReactElement;

				/**
				 * 함수 컴포넌트를 실행하기 전 stateIndex와 실행 후 stateIndex 사이의 배열을 복사하여
				 * virtualNode.states에 저장.
				 */
				const stateIndexBefore = getStateIndex();

				const newVirtualNode = new VirtualNode(
					currentNode.component!({
						...props,
						children,
					})
				);

				const stateIndexAfter = getStateIndex();

				currentNode.startStateIndex = stateIndexBefore;
				currentNode.endStateIndex = stateIndexAfter;
				currentNode.states = getStates().slice(
					stateIndexBefore,
					stateIndexAfter
				);

				currentNode.appendChild(newVirtualNode);
			}

			if (currentNode.children.length) {
				currentNode.children.forEach((child) => {
					currentNode = child;
					traverse();
				});
			}
		})();

		return newTree;
	}

	/**
	 * tagName이 다르면 가상 노드를 기반으로 요소를 새로 생성 후 실제 노드와 교체한다.
	 * attribute만 다르면 실제 노드를 유지하고 attribute만 수정한다.
	 * 가상 노드가 텍스트 노드일 때는 실제 텍스트 노드를 수정한다.
	 * @param virtualNode 리렌더링 된 가상 노드
	 * @param node 현재 브라우저 화면에 존재하는 실제 노드
	 */
	static compare(virtualNode: VirtualNode, realNode: Node): Node {
		if (virtualNode.type === "primitive") {
			if (String(virtualNode.content) !== realNode.textContent) {
				console.log(virtualNode);
				console.log(
					"virtual: " +
						String(virtualNode.content) +
						", real: " +
						realNode.textContent
				);
				realNode.textContent = virtualNode.content as string;
			}

			return realNode;
		}

		if (virtualNode.name !== realNode.nodeName.toLowerCase()) {
			const newElement = document.createElement(virtualNode.name!);

			if (virtualNode.onClick) {
				newElement.addEventListener("click", virtualNode.onClick);
			}
			if (virtualNode.onChange) {
				newElement.addEventListener("change", virtualNode.onChange);
			}

			Object.entries((virtualNode.content as ReactElement).props ?? {}).forEach(
				([key, value]) => {
					if (hasSetter(newElement, key)) newElement[key] = value;

					if (key === "onClick" || key === "onChange") return;
				}
			);

			realNode.parentNode &&
				realNode.parentNode.replaceChild(newElement, realNode);

			return newElement;
		}

		if (virtualNode.onClick) {
			(realNode as HTMLElement).addEventListener("click", virtualNode.onClick);
		}
		if (virtualNode.onChange) {
			realNode.addEventListener("change", virtualNode.onChange);
		}

		Object.entries((virtualNode.content as ReactElement).props ?? {}).forEach(
			([key, value]) => {
				if (hasSetter(realNode, key)) realNode[key] = value;

				if (key === "onClick" || key === "onChange") return;
			}
		);

		return realNode;
	}

	realizeVirtualDOMTree() {
		let currentVirtualNode = this.root!;
		let currentRealNode: Node = this.realRoot!;

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

					/**
					 * todo: HTMLInputElement에 'input' 이벤트가 발생할 때마다
					 * 리렌더링하면서 포커스를 잃어버리는 문제 해결 방안
					 * - input.value = 'foo'; 형식의 코드가 실행되면 포커스가 해제되지 않는다.
					 * input 요소 자체를 리렌더링하지 않고 기존 요소의 어트리뷰트만 업데이트 하는 방법을 생각해봐야 함.
					 * setAttribute는 HTML attriute의 값은 바꾸지만 실제 입력 필드의 값을 바꾸지는 못함.
					 */
					if (virtualChild.type === "htmlElement") {
						if (realChild) {
							currentRealNode = VirtualDOM.compare(virtualChild, realChild);
						} else {
							const newElement = document.createElement(virtualChild.name!);

							if (virtualChild.onClick) {
								newElement.addEventListener("click", virtualChild.onClick);
							}
							if (virtualChild.onChange) {
								newElement.addEventListener("change", virtualChild.onChange);
							}

							Object.entries(
								(virtualChild.content as ReactElement).props ?? {}
							).forEach(([key, value]) => {
								if (hasSetter(newElement, key)) newElement[key] = value;

								if (key === "onClick" || key === "onChange") return;
							});

							currentRealNode = currentRealNode.appendChild(newElement);
						}
					}

					if (virtualChild.type === "primitive") {
						if (realChild) {
							currentRealNode = VirtualDOM.compare(virtualChild, realChild);
						} else {
							currentRealNode = currentRealNode.appendChild(
								// virtualChild.content 값은 'object'를 제외한 모든 값이 될 수 있습니다. 예외 처리 필요
								document.createTextNode(virtualChild.content as string)
							);
						}
					}

					currentVirtualNode = virtualChild;
					realChildNodeIndex =
						currentVirtualNode.type === "component"
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

			// currentVirtualNode가 컴포넌트라면 currentRealNode는 부모 노드로 이동하지 않음
			if (currentVirtualNode.type === "component") return realChildNodeIndex;

			currentRealNode = currentRealNode.parentNode ?? currentRealNode;

			return 1;
		})();
	}

	render(reactElement: ReactElement) {
		if (!this.root) {
			throw new Error(
				"루트 노드가 존재해야 합니다. createRoot()를 호출하여 루트 노드를 생성하세요."
			);
		}

		const newTree = VirtualDOM.generateVirtualDOMTree(reactElement);

		this.root.appendChild(newTree);

		this.realizeVirtualDOMTree();
	}

	/**
	 * 현재 트리와 새로운 트리를 비교 후 실제 DOM 교체
	 * todo: 변경이 필요한 DOM 요소만 교체할 수 있어야 함.
	 */
	rerender() {
		let currentNode = this.root!;

		(function traverse(this: VirtualDOM) {
			if (currentNode.type === "component") {
				const prevStates = currentNode.states;
				const { startStateIndex, endStateIndex } = currentNode;
				const currentStates = getStates().slice(startStateIndex, endStateIndex);

				// 컴포넌트의 상태가 업데이트 되었다면
				if (
					prevStates?.some((prevState, i) => prevState !== currentStates[i])
				) {
					// 재실행하는 컴포넌트의 stateIndex에 맞도록 React 내부 stateIndex를 인위적으로 변경해야 함
					setStateIndex(currentNode.startStateIndex!);

					// 새로운 VirtualNode 생성 후 기존 노드와 교체
					const newSubTree = VirtualDOM.generateVirtualDOMTree(
						currentNode.content as ReactElement
					);

					if (currentNode.parentNode) {
						currentNode.parentNode.replaceChild(currentNode, newSubTree);
					} else {
						this.root = newSubTree;
					}

					currentNode = newSubTree;
					currentNode.states = currentStates;
				}
			}

			if (currentNode.children.length) {
				currentNode.children.forEach((child) => {
					currentNode = child;
					traverse.call(this);
				});
			}
		}).call(this);

		this.realizeVirtualDOMTree();
	}
}
