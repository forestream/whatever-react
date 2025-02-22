import { useState } from "@/react/jsx-runtime";
import { SyntheticEvent } from "@/react/types";

interface RadioGroupProps {
	initValue: string;
	question: string;
	options: string[];
	name?: string;
	onChange?: (value: string | string[]) => void;
}

const RadioGroup = ({
	name,
	initValue = "",
	question,
	options,
	onChange,
}: RadioGroupProps) => {
	const [selected, setSelected] = useState(initValue);

	const handleChange = (
		option: string,
		e: SyntheticEvent<HTMLInputElement>
	) => {
		setSelected(option);
		if (onChange) onChange(e.target.value);
	};

	return (
		<div className="radio-group">
			<p>{question}</p>
			{options.map((option) => (
				<div className="radio-group__option" key={option}>
					<div>
						<input
							name={name}
							id={option}
							type="radio"
							value={option}
							checked={selected === option}
							onChange={(e) => handleChange(option, e)}
						/>
					</div>
					<label htmlFor={option}>{option}</label>
				</div>
			))}
		</div>
	);
};

export default RadioGroup;
