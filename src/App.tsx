import { useState } from "@/react/jsx-runtime";
import Horizontal from "./Horizontal";
import Counter from "./Counter";

export default function App() {
	const [count, setCount] = useState(0);
	const [count2, setCount2] = useState(0);
	const [count3, setCount3] = useState(0);
	const [todos, setTodos] = useState(["hiking", "running"]);
	const [todoText, setTodoText] = useState("");

	const handleClick = () => {
		setCount(count + 1);
		setCount2(count2 + 2);
	};
	const handleCounter = () => setCount3(count3 + 3);

	const handleAddTodo = () => {
		setTodos([...todos, todoText]);
		setTodoText("");
	};

	const handleChange = (e: Event) => {
		setTodoText((e.target as HTMLInputElement).value);
		(e.target as HTMLInputElement).focus();
	};

	console.log("render App comp");

	return (
		<main class="main">
			<p>counter: {count}</p>
			<button id="increase" onClick={handleClick}>
				+
			</button>
			<p>counter: {count2}</p>
			<button id="increase" onClick={handleClick}>
				+
			</button>
			<Counter />
			<Counter onClick={handleCounter}>{count3}</Counter>
			<Horizontal class="horizontal" />
			<form>
				<input value={todoText} onChange={handleChange} />
				<button onClick={handleAddTodo} id="add-todo">
					할 일 추가
				</button>
			</form>
			<div class="todo-item__container">
				{todos.map((todo) => (
					<div class="todo-item">
						<p>{todo}</p>
						<input type="checkbox" class="checkbox" />
					</div>
				))}
			</div>
		</main>
	);
}
