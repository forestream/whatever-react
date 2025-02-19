import { PropsWithChildren } from "@/react/types";

interface ButtonProps {
	disabled?: boolean;
	className?: string;
	type?: "button" | "submit";
	onClick?: () => void;
	id?: string;
}

const Button = ({
	type = "submit",
	disabled = false,
	className,
	children,
	id,
	onClick,
}: PropsWithChildren<ButtonProps>) => {
	return (
		<button
			id={id}
			type={type}
			onClick={onClick}
			disabled={disabled}
			className={className}
		>
			{children}
		</button>
	);
};

export default Button;
