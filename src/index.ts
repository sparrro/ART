import { dbAdd, dbAddHdi, dbTest } from "./apiCalls";
import { countryPages, createCountryMenu, createHdiStartButton, createIQQuestionnaire, createRegionMenu } from "./components";
import {
    TOKEN,
    SERVER_ID,
    MY_ID,
    IQ_CHANNEL_ID,
    LOLAPAZ_ID,
} from "./environment";
import countries from "../data/hdiData.json";
import { questionType } from "./types";
import questions from "../data/questions.json";
import {
    Channel,
    Client,
    GatewayIntentBits,
    TextChannel,
} from "discord.js";
import { paginate } from "./helpers";
import { countrySelectionState } from "./state";

let iqChannel: Channel | undefined | null;

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ]
});

client.once("clientReady", async () => {
    console.log(`Logged in as ${client.user!.tag}`);

    const server = client.guilds.cache.get(SERVER_ID!);
    if (!server) {
        console.log("Couldn't find server");
        return;
    };

    const components = createCountryMenu(0);

    await server.members.fetch();
    const father = server.members.cache.get(MY_ID!);
    

    const herOfficial = server.members.cache.get(LOLAPAZ_ID!);

    /* for (const member of [father, herOfficial]) {
        try {
            const dm = await member?.createDM();

            const messages = await dm?.messages.fetch({ limit: 100 });

            for (const [, message] of messages!) {
                if (message.author.id == client.user!.id) {
                    await message.delete();
                };
            };
        } catch (err) {
            console.log(err);
        };
    }; */

    await father?.send("I'm online");

    iqChannel = await client.channels.fetch(IQ_CHANNEL_ID!) as TextChannel;

    if (!iqChannel) {
        console.log("Couldn't find the iq channel");
    } else {
        const startBtn = createHdiStartButton();
        const channelMsgs = await iqChannel.messages.fetch({limit: 1});
        if (channelMsgs.size == 0) {
            await iqChannel.send({
                content: "Click my button to record your hdi",
                components: startBtn
            });
        };
    };

});

client.login(TOKEN);

//start hdi test
/* client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId != "start_hdi_recording") return;
    const components = createCountryMenu(0);
    await interaction.user.send({
        content:
            `Select your country:\n` +
            `Page ${1}/${countryPages.length}`,
        components
    });
    return;
}); */

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId != "start_hdi_recording") return;
    const qCopy = questions;
    const components = createIQQuestionnaire(questions[0]);
    await interaction.user.send({
        content: questions[0].question,
        components
    });
    return;
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (!interaction.customId.endsWith("?")) return;
    const question = questions.find(q =>
        q.question == interaction.customId
    );
    const answer = question!.options.find(o =>
        o.answer == interaction.values[0]
    );
    await interaction.update(answer?.correct ? "Correct!" : "Wrong!")
    return;
});

//test for api connection
client.on("messageCreate", async (message) => {
    if (message.author.id != MY_ID) return;
    if (message.content.toLowerCase().includes("store")) {
        const extracts = message.content.match(/"([^"]+)"/);
        if (!extracts) {
            console.log("No userId found");
            return;
        };
        const userId = extracts[1];
        const score = message.content.slice(-3);
        const response = await dbAdd(userId, score);
        console.log(response);
    };
});

//country + region selection
client.on("interactionCreate", async (interaction) => {
    if (interaction.isStringSelectMenu()) {

        //country selected
        if (interaction.customId.startsWith("country_select")) {

            const countryName = interaction.values[0];
            const country = countries.find(country =>
                country.country == countryName
            );
            if (!country) {
                console.log("Couldn't find the selected country");
                return;
            };

            countrySelectionState.set(interaction.user.id, {
                country: countryName
            });

            const regionPages = paginate(country.regions);
            const components = createRegionMenu(country, 0);

            await interaction.update({
                content: `**${country.country}** selected; now select your region:\nPage 1/${regionPages.length}`,
                components
            });

            return;
        }

        //region selected
        if (interaction.customId.startsWith("region_select")) {

            const state = countrySelectionState.get(interaction.user.id);
            if (!state?.country) {
                console.log("Couldn't remember the country");
                return;
            };
            const country = countries.find(country =>
                country.country == state.country
            );

            const regionName = interaction.values[0];
            const region = country!.regions.find(region => {
                    return region.region == regionName
                }
            );

            await interaction.update({
                content:
                    `**${region!.region}** selected\n` +
                    `**${region!.region}** has an HDI of ${region?.hdi}`,
                components: []
            });
            
            const dbEntry = await dbAddHdi(interaction.user.id, region!.hdi);
            console.log(dbEntry)

            countrySelectionState.delete(interaction.user.id);

            return dbEntry;
        };
    };

    //pagination buttons
    if (interaction.isButton()) {

        const match = interaction.customId.match(/^(country|region)_(previous|next)_(\d+)$/);
        if (!match) return;

        const type = match[1];
        const direction = match[2];
        const currentPage = Number(match[3]);

        const newPage = direction == "next" ? currentPage + 1 : currentPage - 1;

        if (type == "country") {
            if (newPage < 0 || newPage >= countryPages.length) return;

            const components = createCountryMenu(newPage);

            await interaction.update({
                content:
                    `Select your country:\n` +
                    `Page ${newPage + 1}/${countryPages.length}`,
                components
            });

            return;
        };

        if (type == "region") {

            const state = countrySelectionState.get(
                interaction.user.id
            );
            if (!state?.country) {
                console.log("Couldn't remember the country");
                return;
            };
            const country = countries.find(country =>
                country.country == state.country
            );

            const regionPages = paginate(country!.regions);

            if (newPage < 0 || newPage >= regionPages.length) return;

            const components = createRegionMenu(country!, newPage);

            await interaction.update({
                content:
                    `Select your region in **${country!.country}**:\n` +
                    `Page ${newPage + 1}/${regionPages.length}`,
                    components
            });

            return;
        }
    }
});

//iq test
client.on("interactionCreate", (interaction) =>{
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId) {}
    }
});