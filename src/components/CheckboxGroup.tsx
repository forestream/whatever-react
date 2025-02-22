import { useState } from "@/react/jsx-runtime";
import { SyntheticEvent } from "@/react/types";

interface CheckboxGroupProps {
	initValue: string[];
	question: string;
	options: string[];
	name?: string;
	onChange?: (value: string | string[]) => void;
}

const CheckboxGroup = ({
	name,
	initValue = [],
	question,
	options,
	onChange,
}: CheckboxGroupProps) => {
	const [selected, setSelected] = useState<string[]>(initValue);

	const handleCheckboxChange = (option: string, e: SyntheticEvent) => {
		const nextSelected = selected.includes(option)
			? selected.filter((item) => item !== option)
			: [...selected, option];

		setSelected(nextSelected);

		if (onChange) onChange(nextSelected);
	};

	return (
		<div className="checkbox-group">
			<p>{question}</p>
			{options.map((option) => (
				<div className="checkbox-group__option" key={option}>
					<div>
						<input
							id={option}
							name={name}
							type="checkbox"
							value={option}
							checked={selected.includes(option)}
							onChange={(e) => handleCheckboxChange(option, e)}
						/>
					</div>
					<label htmlFor={option}>{option}</label>
				</div>
			))}
		</div>
	);
};

export default CheckboxGroup;
