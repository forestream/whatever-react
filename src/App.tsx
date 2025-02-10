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
		<main className="main">
			<h1>할 일</h1>
			<Horizontal className="horizontal" />
			<form className="todo-form">
				<div className="todo-form__input-container">
					<input
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
