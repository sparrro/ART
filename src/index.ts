import {
    TOKEN,
    SERVER_ID,
    MY_ID,
} from "./config";
import {
    Client,
    GatewayIntentBits,
} from "discord.js";



const client = new Client({
    intents: []
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
    await father?.send("I'm online");
});

client.login(TOKEN);