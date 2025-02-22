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

const initResponses = Array.from({ length: SURVEY.length }, (_, i) => {
	const response =
		SURVEY[i].type === "checkbox"
			? []
			: SURVEY[i].type === "radio"
			? ""
			: SURVEY[i].type === "text"
			? ""
			: "";

	return {
		question: SURVEY[i].question,
		response,
	};
});

interface SurveyResponse {
	question: string;
	response: string | string[] | File;
}

export default function App() {
	const [questionPage, setQuestionPage] = useState(1);
	const insertionPoint = (questionPage - 1) * QUESTIONS_PER_PAGE;

	const questions = SURVEY.slice(
		(questionPage - 1) * QUESTIONS_PER_PAGE,
		questionPage * QUESTIONS_PER_PAGE
	);

	const [surveyResponses, setSurveyResponses] =
		useState<SurveyResponse[]>(initResponses);

	const isFormValid: boolean = true;

	const handleResponse = (index: number, value: string | string[]) => {
		setSurveyResponses((prev) => [
			...prev.slice(0, index),
			{ ...prev[index], response: value },
			...prev.slice(index + 1),
		]);
	};

	const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();

		const directive = (e.nativeEvent as SubmitEvent).submitter!.id;

		if (directive === "prev") {
			setQuestionPage((page) => (page <= 1 ? 1 : page - 1));
		}

		if (directive === "next") {
			setQuestionPage((page) =>
				page >= QUESTION_PAGES ? QUESTION_PAGES : page + 1
			);
		}

		if (directive === "submit") {
			console.log(JSON.stringify(surveyResponses, null, 2));
		}
	};

	return (
		<>
			<main>
				<form onSubmit={handleSubmit} className="form__container">
					{questions.map((question, i) => (
						<QuestionContainer key={question.question}>
							{question.type === "text" && (
								<InputField
									onChange={(value) =>
										handleResponse(insertionPoint + i, value)
									}
									initValue={
										surveyResponses[insertionPoint + i].response as string
									}
									name={question.question}
									label={question.question}
									type={question.type}
									required={question.required}
								/>
							)}
							{question.type === "checkbox" && (
								<CheckboxGroup
									onChange={(value) =>
										handleResponse(insertionPoint + i, value)
									}
									initValue={
										surveyResponses[insertionPoint + i].response as string[]
									}
									name={question.question}
									question={question.question}
									options={question.options!}
								/>
							)}
							{question.type === "radio" && (
								<RadioGroup
									onChange={(value) =>
										handleResponse(insertionPoint + i, value)
									}
									initValue={
										surveyResponses[insertionPoint + i].response as string
									}
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
							<Button
								disabled={!isFormValid}
								id="submit"
								className="form__submit-button"
							>
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
