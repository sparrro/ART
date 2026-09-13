import dotenv from "dotenv";

dotenv.config();

const {
    TOKEN,
    CLIENT_ID,
    SERVER_ID,
    MY_ID,
    MODROLE_ID,
    LOLAPAZ_ID,
    AMY_ID,
    ENEMY_ID,
    GLOO_ID,
    LYKOPHOS_ID,
    NAMIRE_ID,
    TEEMOTHEE_ID,
    QATARI_ID,
    CASPIAN_ID,
    HATERS_ID,
    MURKY_ID
} = process.env;

if (
    !TOKEN ||
    !CLIENT_ID ||
    !SERVER_ID ||
    !MY_ID ||
    !MODROLE_ID ||
    !LOLAPAZ_ID ||
    !AMY_ID ||
    !ENEMY_ID ||
    !GLOO_ID ||
    !LYKOPHOS_ID ||
    !NAMIRE_ID ||
    !TEEMOTHEE_ID ||
    !QATARI_ID ||
    !CASPIAN_ID ||
    !HATERS_ID ||
    !MURKY_ID
) throw new Error("Missing environment variables");

export {
    TOKEN,
    CLIENT_ID,
    SERVER_ID,
    MY_ID, 
    MODROLE_ID,
    LOLAPAZ_ID,
    AMY_ID,
    ENEMY_ID,
    GLOO_ID,
    LYKOPHOS_ID,
    NAMIRE_ID,
    TEEMOTHEE_ID,
    QATARI_ID,
    CASPIAN_ID,
    HATERS_ID,
    MURKY_ID
};