import { testProgressType } from "./types";
import { questionType, resultDataType } from "./types";
import questionsData from "../data/testQuestions.json";
import { dbGetOne } from "./apiCalls";
import { testProgressState } from "./state";

const questions = questionsData as questionType[];

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
    let verbalScore: undefined | number;
    let numericalScore: undefined | number;
    let abstractScore: undefined | number;
    let generalKnowledge: undefined | number;
    for (const [property, value] of Object.entries(input as Record<string, unknown>)) {
        if (value === true) {
            if (property.startsWith("V_")) {
                verbalScore ? verbalScore++ : verbalScore = 1;
            } else if (property.startsWith("N_")) {
                numericalScore ? numericalScore++ : numericalScore = 1;
            } else if (property.startsWith("A_")) {
                abstractScore ? abstractScore++ : abstractScore = 1;
            } else if (property.startsWith("G_")) {
                generalKnowledge ? generalKnowledge++ : generalKnowledge = 1;
            };
        } else {
            if (property.startsWith("V_") && !verbalScore) verbalScore = 0;
            if (property.startsWith("N_") && !numericalScore) numericalScore = 0;
            if (property.startsWith("A_") && !abstractScore) abstractScore = 0;
            if (property.startsWith("G_") && !generalKnowledge) generalKnowledge = 0;
        };
    };
    const finalScores: resultDataType = {
        userId: id,
        country: input.country,
        region: input.region,
        hdi: input.hdi,
        verbalScore,
        numericalScore,
        abstractScore,
        generalKnowledge,
        score: 1 //placeholder; will be calculated once there's enough data from people taking the test
    }
    return finalScores;
};

export const splitQuestions = (category: "V" | "N" | "A" | "G") => {
    const categoryQuestions = questions.filter(question => question.category == category);
    return categoryQuestions;
};

export const preventedFromTesting = async (id: string, mode: "hdi" | "full" | "V" | "N" | "A" | "G") => {
    
    const alreadyTesting = testProgressState.get(id);
    if (alreadyTesting) return "You may only do one test at a time\nFinish the one you're already on first";
    if (mode == "hdi") return false;

    const priortest = await dbGetOne(id);
    if (!priortest.success) return false;
    const oldResult = priortest.data;
    const now = Date.now();
    const sixMonths = 1000 * 60 * 60 * 24 * 30 * 6;
    if (mode == "full") {
        if (
            typeof oldResult.verbalScore != "number" ||
            typeof oldResult.numericalScore != "number" ||
            typeof oldResult.abstractScore != "number" ||
            typeof oldResult.generalKnowledge != "number"
        ) return "As you have already done some parts of the test separately you may not do the full test\nInstead, you must also do the remaining parts separately";
        const verbalTime = new Date(oldResult.verbalUpdatedAt!).toLocaleDateString();
        const numericalTime = new Date(oldResult.numericalUpdatedAt!).toLocaleDateString();
        const abstractTime = new Date(oldResult.abstractUpdatedAt!).toLocaleDateString();
        const generalTime = new Date(oldResult.generalUpdatedAt!).toLocaleDateString();
        const tooSoon = [false, false, false, false];
        if (now - oldResult.verbalUpdatedAt! < sixMonths) {
        tooSoon[0] = true;
        };
        if (now - oldResult.numericalUpdatedAt! < sixMonths) {
            tooSoon[1] = true;
        };
        if (now - oldResult.abstractUpdatedAt! < sixMonths) {
            tooSoon[2] = true;
        };
        if (now - oldResult.generalUpdatedAt! < sixMonths) {
            tooSoon[3] = true;
        };
        if (tooSoon.includes(true)) {
            return `You must wait six months before retaking the test or any part of it\n${tooSoon[0] == true ? `You last took the verbal reasoning test on ${verbalTime}\n` : ""}${tooSoon[1] == true ? `You last took the numerical reasoning test on ${numericalTime}\n` : ""}${tooSoon[2] == true ? `You last took the abstract reasoning test on ${abstractTime}\n` : ""}${tooSoon[3] == true ? `You last took the general knowledge test on ${generalTime}` : ""}`;
        };
        return false;
    };
    if (mode == "V") {
        if (typeof oldResult.verbalScore != "number") return false;
        const verbalTime = new Date(oldResult.verbalUpdatedAt).toLocaleDateString();
        if (now - oldResult.verbalUpdatedAt < sixMonths) return `You must wait six months before retaking a part of the test\nYou most recently took the verbal reasoning test on ${verbalTime}`;
        return false;
    };
    if (mode == "N") {
        if (typeof oldResult.numericalScore != "number") return false;
        const numericalTime = new Date(oldResult.numericalUpdatedAt).toLocaleDateString();
        if (now - oldResult.numericalUpdatedAt < sixMonths) return `You must wait six months before retaking a part of the test\nYou most recently took the numerical reasoning test on ${numericalTime}`;
        return false;
    };
    if (mode == "A") {
        if (typeof oldResult.abstractScore != "number") return false;
        const abstractTime = new Date(oldResult.abstractUpdatedAt).toLocaleDateString();
        if (now - oldResult.abstractUpdatedAt < sixMonths) return `You must wait six months before retaking a part of the test\nYou most recently took the abstract reasoning test on ${abstractTime}`;
        return false;
    };
    if (mode == "G") {
        if (typeof oldResult.generalKnowledge != "number") return false;
        const generalTime = new Date(oldResult.generalUpdatedAt).toLocaleDateString();
        if (now - oldResult.generalUpdatedAt < sixMonths) return `You must wait six months before retaking a part of the test\nYou most recently took the general knowledge test on ${generalTime}`;
        return false;
    };
    return false;
};

export const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const timeString = `${minutes > 0 ? `${minutes} minute${minutes != 1 ? "s" : ""} and ` : ""}${remainingSeconds} second${remainingSeconds != 1 ? "s" : ""}`
    return timeString;
};