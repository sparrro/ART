import { dbAdd, dbTest } from "./apiCalls";
import { countryPages, createCountryMenu, createRegionMenu } from "./components";
import {
    TOKEN,
    SERVER_ID,
    MY_ID,
    IQ_CHANNEL_ID,
} from "./config/environment";
import countries from "../data/hdiData.json";
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
    await father?.send({
        content:
            `Select your country:\n` +
            `Page ${1}/${countryPages.length}`,
        components
    });

    iqChannel = await client.channels.fetch(IQ_CHANNEL_ID!) as TextChannel;

    if (!iqChannel) {
        console.log("Couldn't find the iq channel");
    } else {
        const channelMsgs = await iqChannel.messages.fetch({limit: 1});
        if (channelMsgs.size > 0) {
            //await iqChannel.send("Test");
        };
    };

});

client.login(TOKEN);


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
            

            countrySelectionState.delete(interaction.user.id);

            return;
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
})