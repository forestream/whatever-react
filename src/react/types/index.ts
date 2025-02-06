export type Child = string | ReactElement;
export type Children = Child[];
export type PropsWithoutChildren = Omit<
	Record<string, unknown>,
	"children"
> | null;
export type PropsWithChildren = PropsWithoutChildren & Children;

export type Component = (props: PropsWithChildren) => ReactElement;

export type ReactElementType = Component | keyof HTMLElementTagNameMap;

export type ReactElement = {
	type: ReactElementType;
	props: PropsWithoutChildren;
	children?: Children;
};

export class VirtualNode {
	type: "HTMLElement" | "component" | "string";
	name?: Component["name"] | HTMLElementTagNameMap;
	props?: PropsWithoutChildren;
	children?: (VirtualNode | VirtualDOM)[];
	value?: string;

	constructor(node: ReactElement | string) {
		if (typeof node === "string") {
			this.type = "string";
			this.value = node;
			return;
		}

		if (typeof node.type === "function") {
			this.type = "component";
			this.name = node.type.name;
			this.props = node.props;
			this.children =
				node.children &&
				node.children.flat(Infinity).map((child) => new VirtualNode(child));
			return;
		}

		this.type = "HTMLElement";
		this.name = node.type;
		this.props = node.props;
		this.children =
			node.children &&
			node.children.flat(Infinity).map((child) => new VirtualNode(child));
	}
}

export class VirtualDOM {
	root: null | VirtualNode;

	constructor() {
		this.root = null;
	}

	createRoot(node: ReactElement | string) {
		this.root = new VirtualNode(node);
	}
}
