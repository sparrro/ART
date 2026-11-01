import verbalQuestions from "../data/verbalQuestions.json";
import numericalQuestions from "../data/numericalQuestions.json";
import abstractQuestions from "../data/abstractQuestions.json";
import generalQuestions from "../data/generalQuestions.json";
import { questionType } from "./types";

export const questions: questionType[] = [
    ...verbalQuestions as questionType[],
    ...numericalQuestions as questionType[],
    ...abstractQuestions as questionType[],
    ...generalQuestions as questionType[]
];