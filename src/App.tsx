import { useState } from "@/react/jsx-runtime";
import "./styles/form.css";
import "./App.css";
import InputField from "./components/InputField";
import RadioGroup from "./components/RadioGroup";
import CheckboxGroup from "./components/CheckboxGroup";
import QuestionContainer from "./components/QuestionContainer";
import { SURVEYS } from "./constants/questions";
import Button from "./components/Button";
import { SyntheticEvent } from "./react/types";

const QUESTION_PAGES = 3;

const SURVEY = SURVEYS[0];

const QUESTIONS_PER_PAGE = Math.ceil(SURVEY.length / QUESTION_PAGES);

interface SurveyResponse {
	question: string;
	response: string;
}

export default function App() {
	const [questionPage, setQuestionPage] = useState(1);

	const questions = SURVEY.slice(
		(questionPage - 1) * QUESTIONS_PER_PAGE,
		questionPage * QUESTIONS_PER_PAGE
	);

	const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);

	const isFormValid: boolean =
		name && email.includes("@") && phone.match(/^\d{10,11}$/) && option;

	const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
		console.log(e);
		e.preventDefault();

		const directive = (e.nativeEvent as SubmitEvent).submitter!.id;

		const formData = new FormData(e.target);
		formData.forEach((v) => console.log(v));

		if (directive === "prev") {
			setQuestionPage((page) => (page <= 1 ? 1 : page - 1));
		}

		if (directive === "next") {
			setQuestionPage((page) =>
				page >= QUESTION_PAGES ? QUESTION_PAGES : page + 1
			);
		}

		if (directive === "submit") {
		}
	};

	return (
		<>
			<main>
				<form onSubmit={handleSubmit} className="form__container">
					{questions.map((question) => (
						<QuestionContainer>
							{question.type === "text" && (
								<InputField
									name={question.question}
									label={question.question}
									type={question.type}
									required={question.required}
								/>
							)}
							{question.type === "checkbox" && (
								<CheckboxGroup
									name={question.question}
									question={question.question}
									options={question.options!}
								/>
							)}
							{question.type === "radio" && (
								<RadioGroup
									name={question.question}
									options={question.options!}
									question={question.question}
								/>
							)}
						</QuestionContainer>
					))}
					<div className="form__button-container">
						{questionPage > 1 && (
							<Button id="prev" className="form__button">
								뒤로
							</Button>
						)}
						{questionPage < QUESTION_PAGES && (
							<Button id="next" className="form__button">
								다음
							</Button>
						)}
						{questionPage === QUESTION_PAGES && (
							<Button disabled={isFormValid} className="form__submit-button">
								제출
							</Button>
						)}
					</div>
				</form>
			</main>
			<footer></footer>
		</>
	);
}
