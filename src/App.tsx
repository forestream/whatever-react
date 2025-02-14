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
		setTodos((todos) => [...todos, { content: todoText, done: false }]);
		setTodoText("");
	};

	const handleChange = (e: Event) => {
		setTodoText((e.target as HTMLInputElement).value);
	};

	const handleToggleDone = (_e: Event, index: number) => {
		console.log(index);
		setTodos((todos) => [
			...todos.slice(0, index),
			{ ...todos[index], done: !todos[index].done },
			...todos.slice(index + 1),
		]);
	};

	return (
		<>
			<header>
				<h1>Whatever</h1>
			</header>
			<main>
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
					{todos.map((todo, i) => {
						console.log(i);
						return (
							<div className="todo-item">
								<p className="todo-item__content">{todo.content}</p>
								<div className="todo-item__checkbox-container">
									<label
										htmlFor={i}
										className={`todo-item__checkbox ${
											todo.done ? "todo-item__checkbox--checked" : ""
										}`}
									>
										<input
											id={i}
											name={todo.content}
											type="checkbox"
											checked={todo.done}
											onChange={(e: Event) => handleToggleDone(e, i)}
										/>
										{todo.done && <div className="todo-item__checkmark" />}
									</label>
								</div>
							</div>
						);
					})}
				</div>
			</main>
		</>
	);
}
