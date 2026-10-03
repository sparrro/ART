import { API_BASE_URL } from "./environment";
import { resultDataType } from "./types";

export const dbAdd = async (input: resultDataType) => {
    try {
        console.log(`${API_BASE_URL}/add`)
        const response = await fetch(`${API_BASE_URL}/add`, {
            method: "post",
            body: JSON.stringify({
                "userId": input.userId,
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

export const dbAddHdi = async (id: string, country: string, region: string, hdi: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/hdi`, {
            method: "post",
            body: JSON.stringify({
                "userId": id,
                "country": country,
                "region": region,
                "hdi": hdi
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

export const dbAddVerbal = async (id: string, verbalScore: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/verbal`, {
            method: "post",
            body: JSON.stringify({
                "userId": id,
                "verbalScore": verbalScore
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

export const dbAddNumerical = async (id: string, numericalScore: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/numerical`, {
            method: "post",
            body: JSON.stringify({
                "userId": id,
                "numericalScore": numericalScore
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

export const dbAddAbstract = async (id: string, abstractScore: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/abstract`, {
            method: "post",
            body: JSON.stringify({
                "userId": id,
                "abstractScore": abstractScore
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

export const dbAddGeneral = async (id: string, generalKnowledge: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/general`, {
            method: "post",
            body: JSON.stringify({
                "userId": id,
                "generalKnowledge": generalKnowledge
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