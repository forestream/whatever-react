import { useState } from "@/react/jsx-runtime";
import { Children } from "./react/types";

export default function Counter({
	onClick,
	children,
}: {
	onClick?: () => void;
	children?: Children;
}) {
	const [count, setCount] = useState(0);

	const handleIncrease = () => setCount(count + 1);

	return (
		<div>
			<p>Counter: {children ? children : count}</p>
			<button onClick={onClick ? onClick : handleIncrease}>+</button>
		</div>
	);
}
