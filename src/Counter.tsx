import { useEffect, useState } from "@/react/jsx-runtime";
import { Children } from "./react/types";

export default function Counter({
	onClick,
	children,
}: {
	onClick?: () => void;
	children?: Children;
}) {
	const [count, setCount] = useState(0);

	const handleIncrease = () => {
		console.log("increase");
		setCount((count) => count + 1);
		setCount((count) => count + 1);
	};

	useEffect(() => {
		console.log("effect in Counter");

		return () => console.log("cleanup in Counter");
	}, []);

	useEffect(() => {
		console.log("second effect in Counter");

		return () => console.log("second cleanup in Counter");
	}, []);

	return (
		<div>
			<p>Counter: {children ? children : count}</p>
			<button onClick={onClick ? onClick : handleIncrease}>+</button>
		</div>
	);
}
