import { backGroundDataType, questionType, testProgressType } from "./types";

export const testProgressState = new Map<string, testProgressType>();

export const personalisedQuestionsState = new Map<string, questionType[]>();

export const backgroundProgressState = new Map<string, backGroundDataType>();

export const timerState = new Map<string, { allotedTime: 10000 | 90000000 | 324000000, startedAt: number }>(); //10 seconds (testing) or 25 minutes (partial test) or an hour and a half (full test)