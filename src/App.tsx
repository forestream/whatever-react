import { useState } from "@/react/jsx-runtime";
import Horizontal from "./Horizontal";
import "./App.css";
import Counter from "./Counter";

type Todo = {
	content: string;
	done: boolean;
};

export default function App() {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [todoText, setTodoText] = useState("");
	const [render, setRender] = useState(0);

	if (render < 3) {
		setRender((render) => render + 1);
	}

	console.log(render);
	console.log("render App");
	console.log("todoText: " + todoText);

	const handleAddTodo = (e: Event) => {
		setTodos([...todos, { content: todoText, done: false }]);
		setTodoText("");
	};

	const handleChange = (e: Event) => {
		console.log(e);
		setTodoText((e.target as HTMLInputElement).value);
	};

	const toggleDone = (target: Todo) => {
		console.log(target);
		setTodos(
			todos.map((todo) =>
				todo === target ? { ...target, done: !target.done } : todo
			)
		);
	};

	return (
		<main className="main">
			<Counter />
			<h1>할 일</h1>
			<Horizontal className="horizontal" />
			<form
				className="todo-form"
				onSubmit={(e: Event) => {
					e.preventDefault();
				}}
			>
				<div className="todo-form__input-container">
					<input
						id="todo-input"
						value={todoText}
						onChange={handleChange}
						className="todo-form__input"
					/>
					<button
						onClick={handleAddTodo}
						className="todo-form__button"
						id="add-todo"
					>
						할 일 추가
					</button>
				</div>
			</form>
			<div className="todo-item__container">
				{todos.map((todo) => (
					<div className="todo-item">
						<p>{todo.content}</p>
						<input
							type="checkbox"
							className="checkbox"
							checked={todo.done}
							onChange={() => toggleDone(todo)}
						/>
					</div>
				))}
			</div>
		</main>
	);
}
