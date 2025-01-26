function createElement(
	type: ComponentTypes,
	props: PropsWithoutChildren,
	...children: Children
) {
	const element =
		typeof type === "function"
			? { name: type.name, props, children: type({ ...props, children }) }
			: { name: type, props, children };

	return element;
}

const React = { createElement, Fragment: "Fragment" };

export default React;
