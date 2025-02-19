import { useState } from "@/react/jsx-runtime";

interface CheckboxGroupProps {
	question: string;
	options: string[];
	name?: string;
}

const CheckboxGroup = ({ name, question, options }: CheckboxGroupProps) => {
	const [selected, setSelected] = useState<string[]>([]);

	const handleCheckboxChange = (option) => {
		if (selected.includes(option)) {
			setSelected(selected.filter((item) => item !== option));
		} else {
			setSelected([...selected, option]);
		}
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
							onChange={() => handleCheckboxChange(option)}
						/>
					</div>
					<label htmlFor={option}>{option}</label>
				</div>
			))}
		</div>
	);
};

export default CheckboxGroup;
