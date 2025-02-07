export default function App() {
	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
	};

	return (
		<main className="main">
			<form onSubmit={handleSubmit}>
				<input />
				<button>할 일 추가</button>
			</form>
			<p>Todo content</p>
			<input type="checkbox" />
		</main>
	);
}
