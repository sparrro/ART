import { backGroundDataType, questionType, testProgressType } from "./types";

export const testProgressState = new Map<string, testProgressType>();

export const personalisedQuestionsState = new Map<string, questionType[]>();

export const backgroundProgressState = new Map<string, backGroundDataType>();