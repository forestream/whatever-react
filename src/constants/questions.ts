export interface Question {
	required: boolean;
	type: "radio" | "checkbox" | "text";
	question: string;
	options?: string[];
}

type Survey = Question[];

export const SURVEYS: Survey[] = [
	[
		{
			required: true,
			type: "radio",
			question: "당신은 어떤 유형에 가깝나요?",
			options: [
				"완전한 아침형 (일찍 자고 일찍 일어남)",
				"약간 아침형 (아침이 편하지만 늦게 잘 때도 있음)",
				"중립 (상황에 따라 다름)",
				"약간 저녁형 (밤이 편하지만 가끔 일찍 잘 때도 있음)",
				"완전한 저녁형 (늦게 자고 늦게 일어남)",
			],
		},
		{
			required: false,
			type: "checkbox",
			question: "하루 중 가장 에너지가 넘치는 시간대는?",
			options: [
				"아침 (6~10시)",
				"점심 전후 (11~14시)",
				"오후 (15~18시)",
				"저녁 (19~22시)",
				"밤늦게 (23시 이후)",
			],
		},
		{
			required: true,
			type: "radio",
			question: "일주일에 몇 번 운동하시나요?",
			options: [
				"매일 한다",
				"3~5회 정도 한다",
				"1~2회 정도 한다",
				"거의 하지 않는다",
				"운동을 전혀 하지 않는다",
			],
		},
		{
			required: true,
			type: "checkbox",
			question: "주말에는 주로 무엇을 하나요?",
			options: [
				"집에서 푹 쉰다",
				"친구나 가족과 시간을 보낸다",
				"여행이나 야외 활동을 즐긴다",
				"자기 계발(공부, 독서 등)에 집중한다",
				"기타: ________",
			],
		},
		{
			required: true,
			type: "radio",
			question: "하루 식사 패턴은 어떻게 되나요?",
			options: [
				"아침, 점심, 저녁을 규칙적으로 먹는다",
				"아침을 거르고 점심, 저녁만 먹는다",
				"불규칙하게 먹는다",
				"소식(적게 먹음)하는 편이다",
				"간식과 군것질을 자주 한다",
			],
		},
		{
			required: false,
			type: "radio",
			question: "카페인 음료를 즐겨 마시나요?",
			options: [
				"하루에 2잔 이상 마신다",
				"하루에 1잔 정도 마신다",
				"가끔 마신다",
				"거의 안 마신다",
				"전혀 마시지 않는다",
			],
		},
		{
			required: true,
			type: "radio",
			question: "하루 평균 스마트폰 사용 시간은?",
			options: [
				"1시간 이하",
				"1~3시간",
				"4~6시간",
				"7시간 이상",
				"스마트폰 없이는 못 산다 😆",
			],
		},
		{
			required: true,
			type: "text",
			question: "인생에서 가장 중요하게 생각하는 가치는 무엇인가요?",
		},
	],
];
