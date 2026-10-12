export type allowedQsType = `_${"1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20"}`;

export type questionType = {
    category: "N" | "V",
    difficulty: allowedQsType,
    question: string,
    options: {
        answer: string,
        correct: boolean
    }[]
};

export type countryType = {
    country: string,
    regions: {
        region: string,
        hdi: number
    }[]
};

export type resultDataType = {
    userId: string,
    score?: number,
    verbalScore?: number,
    verbalUpdatedAt?: number,
    numericalScore?: number,
    numericalUpdatedAt?: number,
    abstractScore?: number,
    abstractUpdatedAt?: number,
    generalKnowledge?: number,
    generalUpdatedAt?: number,
    hdi?: number,
    country?: string,
    region?: string
};

export type questionAndAnswerType = {
    question: string,
    answer: string,
    correct: boolean,
    difficulty: number
};

export type backGroundDataType = {
    userId: string,
    verbalAnswers?: questionAndAnswerType[],
    numericalAnswers?: questionAndAnswerType[],
    abstractAnswers?: questionAndAnswerType[],
    generalAnswers?: questionAndAnswerType[],
};