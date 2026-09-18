import dotenv from "dotenv";

dotenv.config();

const {
    TOKEN,
    CLIENT_ID,
    SERVER_ID,
    MY_ID,
    API_BASE_URL,
} = process.env;

if (
    !TOKEN ||
    !CLIENT_ID ||
    !SERVER_ID ||
    !MY_ID ||
    !API_BASE_URL
) throw new Error("Missing environment variables");

export {
    TOKEN,
    CLIENT_ID,
    SERVER_ID,
    MY_ID,
    API_BASE_URL
};