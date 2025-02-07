import { HTML_ELEMENT_TAG_NAMES } from "@/constants";

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

	constructor(node: HTMLElement | ReactElement | string) {
		this.content = node;
		this.children = [];

		// 원시값이나 함수일 때
		if (typeof node !== "object") {
			this.type = "primitive";
			this.content = node;
			return;
		}

		// 루트 노드 생성할 때
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

	generateVirtualDOMTree(reactElement: ReactElement) {
		if (!this.root) {
			throw new Error(
				"루트 노드가 존재해야 합니다. createRoot()로 루트 노드를 생성하세요."
			);
		} else if (!(this.root.content instanceof HTMLElement)) {
			throw new Error(
				"루트 VirtualNode는 HTMLElement 타입이어야 합니다. createRoot() 인수로 HTMLElement를 전달하세요."
			);
		}

		const origin = new VirtualNode(reactElement);

		const newTree = new VirtualNode(this.root.content);
		let currentNode = newTree.appendChild(origin);

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

				const virtualNode = new VirtualNode(
					currentNode.component!({
						...props,
						children: children,
					})
				);

				currentNode.appendChild(virtualNode);
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

	render(reactElement: ReactElement) {
		if (!this.root) {
			console.error(
				"루트 노드가 존재해야 합니다. createRoot()를 호출하여 루트 노드를 생성하세요."
			);
			return;
		}

		const newTree = this.generateVirtualDOMTree(reactElement);
		this.root = newTree;

		const nextRealDOMRoot = document.createDocumentFragment();
		let currentVirtualNode = newTree;
		let currentRealNode: Node = nextRealDOMRoot;

		(function traverse() {
			if (currentVirtualNode.children) {
				currentVirtualNode.children.forEach((child, i) => {
					if (child.type === "component") {
						currentRealNode.appendChild(document.createElement("template"));
					}

					if (child.type === "htmlElement") {
						const newElement = document.createElement(child.name!);
						Object.entries((child.content as ReactElement).props ?? {}).forEach(
							([key, value]) => {
								newElement.setAttribute(key, value as string);
							}
						);
						currentRealNode.appendChild(newElement);
					}

					if (child.type === "primitive") {
						currentRealNode.appendChild(
							// child.content 값은 'object'를 제외한 모든 값이 될 수 있습니다. 예외 처리 추가 필요
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

	rerender() {}
}
