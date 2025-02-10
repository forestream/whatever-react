import { useState } from "@/react/jsx-runtime";
import Horizontal from "./Horizontal";
import "./App.css";

type Todo = {
	content: string;
	done: boolean;
};

export default function App() {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [todoText, setTodoText] = useState("");

	const handleAddTodo = () => {
		setTodos([...todos, { content: todoText, done: false }]);
		setTodoText("");
	};

	const handleChange = (e: Event) => {
		setTodoText((e.target as HTMLInputElement).value);
		(e.target as HTMLInputElement).focus();
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
		<main class="main">
			<h1>할 일</h1>
			<Horizontal class="horizontal" />
			<form class="todo-form">
				<div class="todo-form__input-container">
					<input
						value={todoText}
						onChange={handleChange}
						class="todo-form__input"
					/>
					<button
						onClick={handleAddTodo}
						class="todo-form__button"
						id="add-todo"
					>
						할 일 추가
					</button>
				</div>
			</form>
			<div class="todo-item__container">
				{todos.map((todo) => (
					<div class="todo-item">
						<p>{todo.content}</p>
						<input
							type="checkbox"
							class="checkbox"
							checked={todo.done}
							onChange={() => toggleDone(todo)}
						/>
					</div>
				))}
			</div>
		</main>
	);
}
