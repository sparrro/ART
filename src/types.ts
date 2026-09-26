export type questionIdType = `${"V" | "N"}_${"1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19"}`;

export type questionType = {
    category: "N" | "V" | string,
    difficulty: (
        "_1" |
        "_2" |
        "_3" |
        "_4" |
        "_5" |
        "_6" |
        "_7" |
        "_8" |
        "_9" |
        "_10" |
        "_11" |
        "_12" |
        "_13" |
        "_14" |
        "_15" |
        "_16" |
        "_17" |
        "_18" |
        "_19" |
        "_20" |
        string
    ),
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