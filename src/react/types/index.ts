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
	type: "HTMLElement" | "component" | "string";
	name?: Component["name"] | keyof HTMLElementTagNameMap;
	props?: PropsWithoutChildren;
	children?: VirtualNode[];
	content: ReactElement | string;
	component?: Component;

	constructor(node: ReactElement | string) {
		this.content = node;

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
			this.children =
				node.children &&
				node.children.flat(Infinity).map((child) => new VirtualNode(child));
			return;
		}

		// type이 HTML tag name일 때
		this.type = "HTMLElement";
		this.name = node.type;
		this.props = node.props;
		this.children =
			node.children &&
			node.children.flat(Infinity).map((child) => new VirtualNode(child));
	}
}

export class VirtualDOM {
	root: null | HTMLElement;

	constructor() {
		this.root = null;
	}

	createRoot(htmlElement: HTMLElement) {
		this.root = htmlElement;
	}

	render(reactElement: ReactElement) {
		const nextRealDOMContainer = new DocumentFragment();
		let currentRealNode: Node = nextRealDOMContainer;

		function realize(virtualNode: VirtualNode) {
			if (virtualNode.type === "HTMLElement") {
				const newElement = document.createElement(
					virtualNode.name as keyof HTMLElementTagNameMap
				);

				if (virtualNode.props) {
					Object.entries(virtualNode.props).forEach((entry) => {
						if (typeof entry[1] !== "string") {
							console.error("Prop values have to be string.");
							return;
						}

						newElement.setAttribute(entry[0], entry[1]);
					});
				}

				currentRealNode = currentRealNode.appendChild(newElement);

				if (virtualNode.children) {
					virtualNode.children.forEach((child) => {
						realize(child);
					});
				}
			}

			if (virtualNode.type === "string") {
				currentRealNode = currentRealNode.appendChild(
					new Text(virtualNode.content as string)
				);
			}

			if (virtualNode.type === "component" && virtualNode.component) {
				realize(
					new VirtualNode(
						virtualNode.component({
							...virtualNode.props,
							children: virtualNode.children?.map((child) => child.content),
						})
					)
				);
			}

			currentRealNode = currentRealNode.parentNode ?? currentRealNode;
		}

		const newNode = new VirtualNode(reactElement);

		realize(newNode);
		console.log(currentRealNode);
		this.root?.appendChild(nextRealDOMContainer);
	}
}
