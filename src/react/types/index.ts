import Child from "@/Child";

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
	type: "root" | "htmlElement" | "component" | "string";
	name?: Component["name"] | keyof HTMLElementTagNameMap;
	props?: PropsWithoutChildren;
	children: VirtualNode[];
	parentNode?: VirtualNode;
	content: HTMLElement | ReactElement | string;
	component?: Component;

	constructor(node: HTMLElement | ReactElement | string) {
		this.content = node;
		this.children = [];

		// 루트 노드 생성할 때
		if (node instanceof HTMLElement) {
			this.type = "root";
			this.name = node.localName;
			return;
		}

		// 문자열일 때
		if (typeof node === "string") {
			this.type = "string";
			this.content = node;
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
		this.type = "htmlElement";
		this.name = node.type;
		this.props = node.props;
	}

	appendChild(node: VirtualNode) {
		if (this.type === "string") {
			throw new Error("string 타입 노드에는 자식 노드를 추가할 수 없습니다.");
		}
		node.parentNode = this;
		this.children.push(node);
		return node;
	}
}

export class VirtualDOM {
	root: null | VirtualNode;

	constructor() {
		this.root = null;
	}

	createRoot(htmlElement: HTMLElement) {
		this.root = new VirtualNode(htmlElement);
		return this;
	}

	generateTree(reactElement: ReactElement) {
		if (!this.root) {
			console.error(
				"루트 노드가 존재해야 합니다. createRoot()로 루트 노드를 생성하세요."
			);
			return;
		} else if (!(this.root.content instanceof HTMLElement)) {
			console.error(
				"루트 VirtualNode는 HTMLElement 타입이어야 합니다. createRoot() 인수로 HTMLElement를 전달하세요."
			);
			return;
		}

		const newNode = new VirtualNode(reactElement);

		let currentNode = this.root;
		currentNode.appendChild(newNode);
		(function traverse() {
			if (currentNode.type === "string") {
				// 동작 없음
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
	}

	render(reactElement: ReactElement) {
		if (!this.root) {
			console.error("루트 노드가 존재해야 합니다.");
			return;
		}

		this.generateTree(reactElement);

		const nextRealDOMContainer = (this.root.content as HTMLElement).cloneNode();
		let currentVirtualNode = this.root;
		let currentRealNode: Node = nextRealDOMContainer;
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
								newElement[key] = value;
							}
						);
						currentRealNode.appendChild(newElement);
					}

					if (child.type === "string") {
						currentRealNode.appendChild(
							document.createTextNode(child.content as string)
						);
					}

					currentVirtualNode = child;
					currentRealNode = currentRealNode.childNodes.item(i);
					traverse();
				});
			}

			if (currentRealNode.nodeName.toLowerCase() === "template") {
				currentRealNode.childNodes.forEach((child) => {
					currentRealNode.parentNode!.appendChild(child);
				});
				const prevNode = currentRealNode;
				currentRealNode = currentRealNode.parentNode ?? currentRealNode;
				currentRealNode.removeChild(prevNode);
				return;
			}
			currentRealNode = currentRealNode.parentNode ?? currentRealNode;
		})();

		(this.root.content as HTMLElement).parentNode?.replaceChild(
			nextRealDOMContainer.cloneNode(true),
			this.root.content as HTMLElement
		);
	}
}
