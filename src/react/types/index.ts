import { HTML_ELEMENT_TAG_NAMES } from "@/constants";
import { getStateIndex, getStates, setStateIndex } from "@/react/jsx-runtime";

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
				// 원시값일 때 동작 없음
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

	realizeVirtualDOMTree(newTree: VirtualNode) {
		this.root = newTree;
		const nextRealDOMRoot = document.createDocumentFragment();

		let currentVirtualNode = this.root;
		let currentRealNode: Node = nextRealDOMRoot;

		(function traverse() {
			if (currentVirtualNode.children) {
				currentVirtualNode.children.forEach((child, i) => {
					if (child.type === "component") {
						currentRealNode.appendChild(document.createElement("template"));
					}

					if (child.type === "htmlElement") {
						const newElement = document.createElement(child.name!);

						if (child.onClick) {
							newElement.addEventListener("click", child.onClick);
						}
						if (child.onChange) {
							newElement.addEventListener("change", child.onChange);
						}

						Object.entries((child.content as ReactElement).props ?? {}).forEach(
							([key, value]) => {
								if (key === "onClick" || key === "onChange") return;
								newElement.setAttribute(key, value as string);
							}
						);
						currentRealNode.appendChild(newElement);
					}

					if (child.type === "primitive") {
						currentRealNode.appendChild(
							// child.content 값은 'object'를 제외한 모든 값이 될 수 있습니다. 예외 처리 필요
							document.createTextNode(child.content as string)
						);
					}

					currentVirtualNode = child;
					currentRealNode = currentRealNode.childNodes.item(i);
					traverse();
				});
			}

			/**
			 * 함수 컴포넌트를 DOM으로 생성할 때 HTMLTemplateElement를 사용 후
			 * 템플릿 하위 요소를 템플릿의 부모 요소에 연결하고
			 * 사용한 템플릿 요소를 제거
			 */
			if (currentRealNode.nodeName.toLowerCase() === "template") {
				currentRealNode.childNodes.forEach((child) => {
					currentRealNode.parentNode!.appendChild(child);
				});
				const templateNode = currentRealNode;
				currentRealNode = currentRealNode.parentNode ?? currentRealNode;
				currentRealNode.removeChild(templateNode);
				return;
			}

			currentRealNode = currentRealNode.parentNode ?? currentRealNode;
		})();

		this.realRoot!.replaceChildren(nextRealDOMRoot);
	}

	render(reactElement: ReactElement) {
		if (!this.root) {
			throw new Error(
				"루트 노드가 존재해야 합니다. createRoot()를 호출하여 루트 노드를 생성하세요."
			);
		}

		const newTree = VirtualDOM.generateVirtualDOMTree(reactElement);

		this.root.appendChild(newTree);

		this.realizeVirtualDOMTree(newTree);
	}

	/**
	 * 현재 트리와 새로운 트리를 비교 후 실제 DOM 교체
	 */
	rerender() {
		let currentNode = this.root!;

		(function traverse(this: VirtualDOM) {
			if (currentNode.type === "component") {
				const prevStates = currentNode.states;
				const { startStateIndex, endStateIndex } = currentNode;
				const currentStates = getStates().slice(startStateIndex, endStateIndex);

				if (
					prevStates?.some((prevState, i) => prevState !== currentStates[i])
				) {
					// 새로운 VirtualNode 생성 후 기존 노드와 교체
					setStateIndex(currentNode.startStateIndex!);

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

		this.realizeVirtualDOMTree(this.root!);
	}
}
