import { useState } from "@/react/jsx-runtime";
import Horizontal from "./Horizontal";
import "./App.css";
import Counter from "./Counter";

type Todo = {
	content: string;
	done: boolean;
};

export default function App() {
	const [todos, setTodos] = useState<Todo[]>([
		{ content: "example", done: false },
	]);
	const [todoText, setTodoText] = useState("");

	const handleAddTodo = () => {
		setTodos((todos) => [...todos, { content: todoText, done: false }]);
		setTodoText("");
	};

	const handleChange = (e: Event) => {
		setTodoText((e.target as HTMLInputElement).value);
	};

	const handleToggleDone = (e: Event, target: Todo) => {
		setTodos((todos) =>
			todos.map((todo) =>
				todo === target
					? { ...target, done: (e.target as HTMLInputElement).checked }
					: todo
			)
		);
	};

	return (
		<>
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
							<p className="todo-item__content">{todo.content}</p>
							<div className="todo-item__checkbox-container">
								<label
									htmlFor="checkbox"
									className={`todo-item__checkbox ${
										todo.done ? "todo-item__checkbox--checked" : ""
									}`}
								>
									<input
										id="checkbox"
										name={todo.content}
										type="checkbox"
										checked={todo.done}
										onChange={(e: Event) => handleToggleDone(e, todo)}
									/>
									<>
										{todo.done && <div className="todo-item__checkmark" />}
										{todo.done && <div className="todo-item__checkmark" />}
										{todo.done && <div className="todo-item__checkmark" />}
										{todo.done && <div className="todo-item__checkmark" />}
									</>
								</label>
							</div>
						</div>
					))}
				</div>
			</main>
		</>
	);
}
