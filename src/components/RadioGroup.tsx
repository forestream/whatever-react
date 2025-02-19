import { useState } from "@/react/jsx-runtime";

interface RadioGroupProps {
	question: string;
	options: string[];
	name?: string;
}

const RadioGroup = ({ name, question, options }: RadioGroupProps) => {
	const [selected, setSelected] = useState("");

	const handleChange = (option: string) => setSelected(option);

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
							onChange={() => handleChange(option)}
						/>
					</div>
					<label htmlFor={option}>{option}</label>
				</div>
			))}
		</div>
	);
};

export default RadioGroup;
