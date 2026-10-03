import { testProgressType } from "./state";
import { resultDataType } from "./types";

export const paginate = <T>(array: T[]): T[][] => {
    const pages: T[][] = [];
    for (let i = 0; i < array.length; i += 25) {
        pages.push(array.slice(i, i + 25));
    };
    return pages;
};

export const scramble = <T>(a: T[]) => {
    const copyA: T[] = a.slice();
    for (let i = 0; i < copyA.length; i++) {
        const current = copyA[i];
        const random = Math.floor(Math.random() * (i + 1));
        copyA[i] = copyA[random];
        copyA[random] = current;
    };
    return copyA;
};

export const countScores = (id: string, input: testProgressType) => {
    let verbalScore = 0;
    let numericalScore = 0;
    let abstractScore = 0;
    let generalKnowledge = 0;
    for (const [property, value] of Object.entries(input as Record<string, unknown>)) {
        if (value === true) {
            if (property.startsWith("V_")) {
                verbalScore++;
            } else if (property.startsWith("N_")) {
                numericalScore++;
            } else if (property.startsWith("A_")) {
                abstractScore++;
            } else if (property.startsWith("G_")) {
                generalKnowledge++;
            };
        };
    };
    const finalScores: resultDataType = {
        userId: id,
        country: input.country!,
        region: input.region!,
        hdi: input.hdi!,
        verbalScore,
        numericalScore,
        abstractScore,
        generalKnowledge,
        score: 1 //placeholder; will be calculated once there's enough data from people taking the test
    }
    return finalScores;
};