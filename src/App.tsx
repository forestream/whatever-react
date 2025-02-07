import { useState } from "@/react/jsx-runtime";

export default function App() {
	const [count, setCount] = useState(0);
	const [count2, setCount2] = useState(1);

	const handleClick = (e: MouseEvent) => {
		if (e.target.id === "increase") {
			setCount(count + 1);
			setCount2(count2 + 2);
		}
	};

	window.removeEventListener("click", handleClick);
	window.addEventListener("click", handleClick);

	return (
		<main class="main">
			<p>counter: {count}</p>
			<p>counter: {count2}</p>
			<button id="increase">+</button>
			{/* <form>
				<input />
				<button>할 일 추가</button>
			</form>
			<div class="todo-item">
				<p>Todo content</p>
				<input type="checkbox" />
			</div> */}
		</main>
	);
}
