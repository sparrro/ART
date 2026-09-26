import { questionType } from "./types";

type testProgressType = {
    country?: string,
    V_1?: boolean,
    V_2?: boolean,
    V_3?: boolean,
    V_4?: boolean,
    V_5?: boolean,
    V_6?: boolean,
    V_7?: boolean,
    V_8?: boolean,
    V_9?: boolean,
    V_10?: boolean,
    V_11?: boolean,
    V_12?: boolean,
    V_13?: boolean,
    V_14?: boolean,
    V_15?: boolean,
    V_16?: boolean,
    V_17?: boolean,
    V_18?: boolean,
    V_19?: boolean,
    V_20?: boolean,
    N_1?: boolean,
    N_2?: boolean,
    N_3?: boolean,
    N_4?: boolean,
    N_5?: boolean,
    N_6?: boolean,
    N_7?: boolean,
    N_8?: boolean,
    N_9?: boolean,
    N_10?: boolean,
    N_11?: boolean,
    N_12?: boolean,
    N_13?: boolean,
    N_14?: boolean,
    N_15?: boolean,
    N_16?: boolean,
    N_17?: boolean,
    N_18?: boolean,
    N_19?: boolean,
    N_20?: boolean
};

export const testProgressState = new Map<string, testProgressType>();

export const personalisedQuestionsState = new Map<string, questionType[]>();