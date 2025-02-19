import { useState } from "@/react/jsx-runtime";
import { SyntheticEvent } from "@/react/types";

interface InputFieldProps {
	name?: string;
	required?: boolean;
	label?: string;
	type?: "text";
	placeholder?: string;
}

const InputField = ({
	name,
	required = true,
	label,
	type = "text",
	placeholder = "",
}: InputFieldProps) => {
	const [value, setValue] = useState("");
	console.log(value);

	const handleChange = (e: SyntheticEvent<HTMLInputElement>) =>
		setValue(e.target.value);

	return (
		<div className="input-field">
			<label htmlFor={name}>{label}</label>
			<input
				id={name}
				name={name}
				type={type}
				value={value}
				onChange={handleChange}
				placeholder={placeholder}
				required={required}
			/>
		</div>
	);
};

export default InputField;
