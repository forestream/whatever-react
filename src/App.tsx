import Parent from "./Parent";
import React from "./react";

export default function App() {
	return (
		<Parent aria-label="parent">
			<p>p tag</p>
			Wrapped by Parent
		</Parent>
	);
}
