import { dbAdd, dbTest } from "./apiCalls";
import {
    TOKEN,
    SERVER_ID,
    MY_ID,
    IQ_CHANNEL_ID,
} from "./config/environment";
import {
    Channel,
    Client,
    GatewayIntentBits,
    TextChannel,
} from "discord.js";

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

    await server.members.fetch();
    const father = server.members.cache.get(MY_ID!);
    await father?.send({
        content: "Select your country:"
    });

    iqChannel = await client.channels.fetch(IQ_CHANNEL_ID!) as TextChannel;

    if (!iqChannel) {
        console.log("Couldn't find the iq channel");
    } else {
        const channelMsgs = await iqChannel.messages.fetch({limit: 1});
        if (channelMsgs.size > 0) {
            await iqChannel.send("Test");
        };
    };

});

client.login(TOKEN);


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