import { API_BASE_URL } from "./environment";
import { resultDataType } from "./types";

export const dbAdd = async (input: resultDataType) => {
    try {
        console.log(`${API_BASE_URL}/add`)
        const response = await fetch(`${API_BASE_URL}/add`, {
            method: "post",
            body: JSON.stringify({
                "userId": input.userId,
                "score": input.score,
                "verbalScore": input.verbalScore,
                "numericalScore": input.numericalScore,
                "abstractScore": input.abstractScore,
                "generalKnowledge": input.generalKnowledge,
                "hdi": input.hdi,
                "country": input.country,
                "region": input.region
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        return data;
    } catch (err) {
        return err;
    };
};

export const dbAddHdi = async (id: string, hdi: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/hdi`, {
            method: "post",
            body: JSON.stringify({
                "userId": id,
                "hdi": hdi
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        return data;
    } catch (err) {
        throw err;
    };
};

export const dbGetOne = async (id: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "get",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        return data;
    } catch (err) {
        return err
    };
};

export const dbTest = async () => {
    try {
        const response = await fetch(API_BASE_URL!, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        return data;
    } catch (err) {
        return err;
    };
};