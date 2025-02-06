import Parent from "./Parent";

export default function App() {
	return (
		<Parent>
			<div style={"width: 100px; height: 100px; background-color: black"}></div>
			<p>This is a paragraph element.</p>
			<main>This is a string wrapped by Parent comp.</main>
		</Parent>
	);
}
