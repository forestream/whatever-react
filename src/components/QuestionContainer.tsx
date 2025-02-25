import "@/components/QuestionContainer.css";
import { PropsWithChildren } from "@/react/types";

export default function QuestionContainer({ children }: PropsWithChildren) {
	return <article className="question-container">{children}</article>;
}
