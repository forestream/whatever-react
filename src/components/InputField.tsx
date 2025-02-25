import { useState } from "@/react/jsx-runtime";
import { SyntheticEvent } from "@/react/types";

interface InputFieldProps {
	name?: string;
	required?: boolean;
	label?: string;
	type?: "text";
	initValue?: string;
	placeholder?: string;
	onChange?: (value: string | string[]) => void;
}

const InputField = ({
	name,
	required = true,
	label,
	type = "text",
	initValue = "",
	placeholder = "",
	onChange,
}: InputFieldProps) => {
	const [value, setValue] = useState(initValue);

	const handleChange = (e: SyntheticEvent<HTMLInputElement>) => {
		setValue(e.target.value);
		if (onChange) onChange(e.target.value);
	};

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
