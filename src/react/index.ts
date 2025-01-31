function createElement(type, props, ...children) {
	return typeof type === "function"
		? {
				type: type.name,
				props: {
					...props,
					children: type({
						...props,
						children: children.length === 1 ? children[0] : children,
					}),
				},
		  }
		: {
				type,
				props: {
					...props,
					children: children.length === 1 ? children[0] : children,
				},
		  };
}

function Fragment({ children }) {
	return children;
}

const React = { createElement, Fragment };

export default React;
