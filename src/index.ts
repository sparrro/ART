import { dbAdd, dbAddAbstract, dbAddGeneral, dbAddHdi, dbAddNumerical, dbAddVerbal, dbDataAdd, dbDataRetrieve, dbGetOne, dbPing, dbTest } from "./apiCalls";
import { countryPages, createCountryMenu, createIQQuestionnaire, createRegionMenu, createStartButtons } from "./components";
import {
    TOKEN,
    SERVER_ID,
    MY_ID,
    IQ_CHANNEL_ID,
    LOLAPAZ_ID,
    TEST_TAKER_ID,
} from "./environment";
import countries from "../data/hdiData.json";
import { allowedQsType, questionType, resultDataType } from "./types";
import questionsData from "../data/testQuestions.json";
import {
    Channel,
    Client,
    GatewayIntentBits,
    TextChannel,
} from "discord.js";
import { clearStates, countScores, formatTime, paginate, preventedFromTesting, randomQuestions, scramble, splitQuestions } from "./helpers";
import { backgroundProgressState, personalisedQuestionsState, testProgressState, timerState } from "./state";

const questions = questionsData as questionType[];

let iqChannel: Channel | undefined | null;

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
    ]
});

client.once("clientReady", async () => {
    console.log(`Logged in as ${client.user!.tag}`);

    const server = client.guilds.cache.get(SERVER_ID!);
    if (!server) {
        console.log("Couldn't find server");
        return;
    };

    const members = await server.members.fetch();
    const father = server.members.cache.get(MY_ID!);

    setInterval(async () => {
        if (testProgressState.size > 0) {
            await dbPing();
        };
    }, 1000 * 60 * 60 * 6);
    
    //deletes all its dms - shouldn't be needed again but you never know
    for (const member of members.values()) {
        if (member.user.bot) continue;
        try {
            const dm = await member.user.createDM();
            const messages = await dm.messages.fetch({ limit: 100 });
            for (const message of messages.values()) {
                if (message.author.id == client.user!.id) {
                    await message.delete();
                };
            };
        } catch (err) {
            await father?.send(`I couldn't delete my dms to ${member.displayName}`);
        };
    }

    await father?.send("I'm online");

    iqChannel = await client.channels.fetch(IQ_CHANNEL_ID!) as TextChannel;

    if (!iqChannel) {
        console.log("Couldn't find the iq channel");
    } else { //posting the start buttons for the test
        /* const startBtn = createHdiStartButton();
        const channelMsgs = await iqChannel.messages.fetch({limit: 1});
        if (channelMsgs.size == 0) {
            await iqChannel.send({
                content: "Click my button to record your hdi",
                components: startBtn
            });
        }; */

        /* const components = createStartButtons();

        await iqChannel.send({
            content: "Do my whole IQ test at once or one section at a time",
            components
        }); */
    };

});

client.login(TOKEN);

//start hdi test
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId != "start_hdi_recording") return;

    await interaction.deferUpdate();

    const initialDm = await interaction.user.send("Please be patient while I make sure my api is awake...");

    const reasonPreventing = await preventedFromTesting(interaction.user.id, "hdi");
    if (reasonPreventing) {
        await initialDm.edit(reasonPreventing);
        return;
    };

    const pingResponse = await dbPing();
    if (pingResponse.success) {
        testProgressState.set(interaction.user.id, {});
        const components = createCountryMenu(0);
        const page = countryPages[0]
        await initialDm.edit({
            content:
                `Select your country:\n` +
                `Page ${1}/${countryPages.length}: ${page[0].country} - ${page[page.length - 1].country}`,
            components
        });
        setTimeout(async () => {
            if (testProgressState.get(interaction.user.id)) {
                await initialDm.edit({
                    content: "You have been timed out",
                    components: []
                });
                clearStates(interaction.user.id);
            };
        }, 1000 * 60 * 10);
        return;
    } else {
        await initialDm.edit("There seems to be something wrong with my api");
    };
});

/* client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId != "start_hdi_recording") return;
    await interaction.deferUpdate();
    const qCopy: questionType[] = scramble(questions);
    qCopy.forEach(q => {
        q.options = scramble(q.options);
    });
    const firstQ = qCopy[0];
    qCopy.shift();
    personalisedQuestionsState.set(interaction.user.id, qCopy);
    testProgressState.set(interaction.user.id, {});
    backgroundProgressState.set(interaction.user.id, {
        userId: interaction.user.id,
        verbalAnswers: []
    })
    const components = createIQQuestionnaire(firstQ);
    await interaction.user.send({
        content: firstQ.question,
        components
    });
    return;
}); */

//answering a question during a test
client.on("interactionCreate", async (interaction) => {

    if (!interaction.isStringSelectMenu()) return;
    if (!interaction.customId.endsWith("?")) return;

    const question = questions.find(q =>
        q.question.endsWith(interaction.customId)
    );
    const answer = question!.options.find(o =>
        o.answer == interaction.values[0]
    );
    const progress = testProgressState.get(interaction.user.id);
    const backGroundProgress = backgroundProgressState.get(interaction.user.id);
    if (!progress || !backGroundProgress) {
        console.log("I somehow lost track of the test progress for " + interaction.user.displayName);
        return;
    };
    const qId = (question!.category + question!.difficulty) as `${"V" | "N" | "A" | "G"}${allowedQsType}`;

    answer?.correct ? progress[qId] = true : progress[qId] = false;
    switch (question!.category) {
        case "V": {
            backGroundProgress.verbalAnswers!.push({
                question: question!.question,
                answer: answer!.answer,
                correct: answer!.correct,
                difficulty: Number(question!.difficulty.slice(1))
            });
            break;
        };
        case "N": {
            backGroundProgress.numericalAnswers!.push({
                question: question!.question,
                answer: answer!.answer,
                correct: answer!.correct,
                difficulty: Number(question!.difficulty.slice(1))
            });
            break;
        };
        case "A": {
            backGroundProgress.abstractAnswers!.push({
                question: question!.question,
                answer: answer!.answer,
                correct: answer!.correct,
                difficulty: Number(question!.difficulty.slice(1))
            });
            break;
        };
        case "G": {
            backGroundProgress.generalAnswers!.push({
                question: question!.question,
                answer: answer!.answer,
                correct: answer!.correct,
                difficulty: Number(question!.difficulty.slice(1))
            });
            break;
        };
    };

    const timer = timerState.get(interaction.user.id);
    if (!timer) {
        console.log(`Failed to retrieve the timer while ${interaction.user.displayName} was taking one of my tests`);
        await interaction.message.edit({
            content: "Something went wrong in my code",
            components: []
        });
        clearStates(interaction.user.id);
        return;
    };
    const now = Date.now();
    const difference = now - timer.startedAt;
    const remaining = timer.allotedTime - difference;
    if (remaining < 1) {
        await interaction.message.edit({
            content: "Unfortunately you ran out of time",
            components: []
        });
        clearStates(interaction.user.id);
        return;
    };

    const qCopy = personalisedQuestionsState.get(interaction.user.id);
    const firstQ = qCopy?.shift();

    if (!firstQ) {
        if (typeof progress.V_1 == "boolean" && typeof progress.N_1 == "boolean") {
            const components = createCountryMenu(0);
            const page = countryPages[0];
            await interaction.message.edit({
                content: `Select your country:\nPage ${1}/${countryPages.length}: ${page[0].country} - ${page[page.length - 1].country}`,
                components
            });
        } else {
            const finalScore = countScores(interaction.user.id, progress);
            //skicka poängen till resultattabellen
            let result;
            if (typeof finalScore.verbalScore == "number" && typeof finalScore.numericalScore == "number") {
                result = await dbAdd(finalScore);
            } else if (typeof finalScore.verbalScore == "number") {
                result = await dbAddVerbal(finalScore.userId, finalScore.verbalScore);
            } else if (typeof finalScore.numericalScore == "number") {
                result = await dbAddNumerical(finalScore.userId, finalScore.numericalScore);
            } else if (typeof finalScore.abstractScore == "number") {
                result = await dbAddAbstract(finalScore.userId, finalScore.abstractScore);
            } else if (typeof finalScore.generalKnowledge == "number") {
                result = await dbAddGeneral(finalScore.userId, finalScore.generalKnowledge);
            } else {
                result = await dbAddHdi(finalScore.userId, finalScore.country!, finalScore.region!, finalScore.hdi!);
            };
            if (!result.success) {
                await interaction.message.edit({
                    content: `Whoops, something went wrong: ${result.message}`,
                    components: []
                });
                console.log(`Error when ${interaction.user.displayName} tried taking the test: ${result.message}`);
                clearStates(interaction.user.id);

                return;
            };
            await dbDataAdd(backGroundProgress);
            if (result.data.verbalScore && result.data.numericalScore && result.data.abstractScore && result.data.generalKnowledge && result.data.hdi) {
                await client.guilds.fetch();
                const server = client.guilds.cache.get(SERVER_ID!);
                const member = server?.members.cache.get(interaction.user.id);
                if (member) {
                    if (!member.roles.cache.has(TEST_TAKER_ID!)) await member.roles.add(TEST_TAKER_ID!);
                };
            };
            await interaction.message.edit({
                content: "Thank you for taking my test",
                components: []
            });
            clearStates(interaction.user.id);
        };
        return;
    } else {
        const components = createIQQuestionnaire(firstQ);
        await interaction.message.edit({
            content: `${formatTime(remaining)} left\n${firstQ.question}`,
            components
        });
    };
    return;
});

//country + region selection
client.on("interactionCreate", async (interaction) => {
    if (interaction.isStringSelectMenu()) {

        await interaction.deferUpdate();

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

            const progress = testProgressState.get(interaction.user.id);
            progress!.country = countryName;

            const regionPages = paginate(country.regions);
            const page = regionPages[0];
            const components = createRegionMenu(country, 0);

            await interaction.message.edit({
                content: `**${country.country}** selected; now select your region:` +
                         `${regionPages.length > 1 ? `\nPage 1/${regionPages.length}: ${page[0].region} - ${page[page.length - 1].region}` : ""}`,
                components
            });

            return;
        }

        //region selected
        if (interaction.customId.startsWith("region_select")) {

            const backGroundProgress = backgroundProgressState.get(interaction.user.id);

            const progress = testProgressState.get(interaction.user.id);
            if (!progress?.country) {
                console.log("Couldn't remember the country");
                return;
            };
            const country = countries.find(country =>
                country.country == progress.country
            );

            const regionName = interaction.values[0];
            const region = country!.regions.find(region => {
                    return region.region == regionName
                }
            );

            await interaction.message.edit({
                content:
                    `**${region!.region}** selected\n` +
                    `**${region!.region}** has an HDI of ${region?.hdi}`,
                components: []
            });
            
            progress!.region = region?.region;
            progress!.hdi = region?.hdi;

            const score = countScores(interaction.user.id, progress);

            if (backGroundProgress) {
                const result = await dbAdd(score);
                if (!result.success) {
                    await interaction.message.edit({
                        content: `Whoops, something went wrong: ${result.message}`,
                        components: []
                    });
                    console.log(`Error when ${interaction.user.id} tried taking the test: ${result.message}`);
                    clearStates(interaction.user.id);
                    return;
                };
                await dbDataAdd(backGroundProgress);
                if (result.data.verbalScore && result.data.numericalScore && result.data.abstractScore && result.data.generalKnowledge) {
                    await client.guilds.fetch();
                    const server = client.guilds.cache.get(SERVER_ID!);
                    const member = server?.members.cache.get(interaction.user.id);
                    if (member) {
                        if (!member.roles.cache.has(TEST_TAKER_ID!)) await member.roles.add(TEST_TAKER_ID!);
                    };
                };
                await interaction.message.edit({
                    content: "Thank you for taking my test",
                    components: []
                });
                clearStates(interaction.user.id);
            } else {
                const result = await dbAddHdi(interaction.user.id, country!.country, region!.region, region!.hdi);
                if (!result.success) {
                    await interaction.message.edit({
                        content: `Whoops, something went wrong: ${result.message}`,
                        components: []
                    });
                    console.log(`Error when ${interaction.user.displayName} tried taking the test: ${result.message}`);
                    clearStates(interaction.user.id);
                    return;
                };
                if (result.data.verbalScore && result.data.numericalScore && result.data.abstractScore && result.data.generalKnowledge) {
                    await client.guilds.fetch();
                    const server = client.guilds.cache.get(SERVER_ID!);
                    const member = server?.members.cache.get(interaction.user.id);
                    if (member) {
                        if (!member.roles.cache.has(TEST_TAKER_ID!)) await member.roles.add(TEST_TAKER_ID!);
                    };
                };
                interaction.message.edit({
                    content: "Thank you for taking my test",
                    components: []
                });
            };

            clearStates(interaction.user.id);
        };
    };

    //pagination buttons
    if (interaction.isButton()) {

        const match = interaction.customId.match(/^(country|region)_(previous|next)_(\d+)$/);
        if (!match) return;
        await interaction.deferUpdate();

        const type = match[1];
        const direction = match[2];
        const currentPage = Number(match[3]);

        const newPage = direction == "next" ? currentPage + 1 : currentPage - 1;

        if (type == "country") {
            if (newPage < 0 || newPage >= countryPages.length) return;

            const components = createCountryMenu(newPage);
            const page = countryPages[newPage];
            await interaction.message.edit({
                content:
                    `Select your country:\n` +
                    `Page ${newPage + 1}/${countryPages.length}: ${page[0].country} - ${page[page.length - 1].country}`,
                components
            });

            return;
        };

        if (type == "region") {

            const state = testProgressState.get(
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
            const page = regionPages[newPage];
            const components = createRegionMenu(country!, newPage);

            await interaction.message.edit({
                content:
                    `Select your region in **${country!.country}**:\n` +
                    `Page ${newPage + 1}/${regionPages.length}: ${page[0].region} - ${page[page.length - 1].region}`,
                    components
            });

            return;
        }
    }
});

//test start buttons

//full test
client.on("interactionCreate", async (interaction) => {

    if (!interaction.isButton()) return;
    if (interaction.customId != "start_full_test") return;
    await interaction.deferUpdate();

    const initialDm = await interaction.user.send("Please be patient while I make sure my api is awake...");

    const pingResponse = await dbPing();

    if (pingResponse.success) {
        const reasonPreventing = await preventedFromTesting(interaction.user.id, "full");
        if (reasonPreventing) {
            await initialDm.edit(reasonPreventing);
            return;
        };

        //make it select random questions into a template
        const qCopy = randomQuestions("full");
        qCopy.forEach(q => {
            q.options = scramble(q.options);
        });

        const firstQ = qCopy[0];
        qCopy.shift();
        personalisedQuestionsState.set(interaction.user.id, qCopy);
        testProgressState.set(interaction.user.id, {});
        backgroundProgressState.set(interaction.user.id, {
            userId: interaction.user.id,
            verbalAnswers: [],
            numericalAnswers: [],
            abstractAnswers: [],
            generalAnswers: []
        });

        timerState.set(interaction.user.id, { allotedTime: 5400000, startedAt: Date.now() });

        const components = createIQQuestionnaire(firstQ);
        await initialDm.edit({
            content: firstQ.question,
            components
        });
        setTimeout(async () => {
            if (testProgressState.get(interaction.user.id)) {
                await initialDm.edit({
                    content: "You have been timed out",
                    components: []
                });
                clearStates(interaction.user.id);
            }
        }, 5400000 + (1000 * 60 * 10));
        return;
    } else {
        await initialDm.edit("There seems to be something wrong with my api");
        return;
    };
});

//verbal test
client.on("interactionCreate", async (interaction) => {

    if (!interaction.isButton()) return;
    if (interaction.customId != "start_verbal_test") return;
    await interaction.deferUpdate();

    const initialDm = await interaction.user.send("Please be patient while i make sure my api is awake...");

    const pingResponse = await dbPing();

    if (pingResponse.success) {
        const reasonPreventing = await preventedFromTesting(interaction.user.id, "V");
        if (reasonPreventing) {
            await initialDm.edit(reasonPreventing);
            return;
        };

        const qCopy = randomQuestions("V");
        qCopy.forEach(q => {
            q.options = scramble(q.options);
        });

        const firstQ = qCopy[0];
        qCopy.shift();
        personalisedQuestionsState.set(interaction.user.id, qCopy);
        testProgressState.set(interaction.user.id, {});
        backgroundProgressState.set(interaction.user.id, {
            userId: interaction.user.id,
            verbalAnswers: []
        });

        timerState.set(interaction.user.id, { allotedTime: 1500000, startedAt: Date.now() });

        const components = createIQQuestionnaire(firstQ);
        await initialDm.edit({
            content: firstQ.question,
            components
        });
        setTimeout(async () => {
            if (testProgressState.get(interaction.user.id)) {
                await initialDm.edit({
                    content: "You have been timed out",
                    components: []
                });
                clearStates(interaction.user.id);
            }
        }, 1500000 + (1000 * 60 * 10));
        return;
    } else {
        await initialDm.edit("There seems to be something wrong with my api");
        return;
    };
});

//numerical test
client.on("interactionCreate", async (interaction) => {

    if (!interaction.isButton()) return;
    if (interaction.customId != "start_numerical_test") return;
    await interaction.deferUpdate();

    const initialDm = await interaction.user.send("Please be patient while I make sure my api is awake...");

    const pingResponse = await dbPing();

    if (pingResponse.success) {
        const reasonPreventing = await preventedFromTesting(interaction.user.id, "N");
        if (reasonPreventing) {
            await initialDm.edit(reasonPreventing);
            return;
        };

        const qCopy = randomQuestions("N");
        qCopy.forEach(q => {
            q.options = scramble(q.options);
        });

        const firstQ = qCopy[0];
        qCopy.shift();
        personalisedQuestionsState.set(interaction.user.id, qCopy);
        testProgressState.set(interaction.user.id, {});
        backgroundProgressState.set(interaction.user.id, {
            userId: interaction.user.id,
            numericalAnswers: []
        });

        timerState.set(interaction.user.id, { allotedTime: 1500000, startedAt: Date.now() });

        const components = createIQQuestionnaire(firstQ);
        await initialDm.edit({
            content: firstQ.question,
            components
        });
        setTimeout(async () => {
            if (testProgressState.get(interaction.user.id)) {
                await initialDm.edit({
                    content: "You have been timed out",
                    components: []
                });
                clearStates(interaction.user.id);
            }
        }, 1500000 + (1000 * 60 * 10));
        return;
    } else {
        await initialDm.edit("There seems to be something wrong with my api");
        return;
    }
});

//abstract test
client.on("interactionCreate", async (interaction) => {

    if (!interaction.isButton()) return;
    if (interaction.customId != "start_abstract_test") return;
    await interaction.deferUpdate();

    const initialDm = await interaction.user.send("Please be patient while I make sure my api is awake...");

    const pingResponse = await dbPing();

    if (pingResponse.success) {
        const reasonPreventing = await preventedFromTesting(interaction.user.id, "A");
        if (reasonPreventing) {
            await initialDm.edit(reasonPreventing);
            return;
        };

        const qCopy = randomQuestions("A");
        qCopy.forEach(q => {
            q.options = scramble(q.options);
        });

        const firstQ = qCopy[0];
        qCopy.shift();
        personalisedQuestionsState.set(interaction.user.id, qCopy);
        testProgressState.set(interaction.user.id, {});
        backgroundProgressState.set(interaction.user.id, {
            userId: interaction.user.id,
            abstractAnswers: []
        });

        timerState.set(interaction.user.id, { allotedTime: 1500000, startedAt: Date.now() });

        const components = createIQQuestionnaire(firstQ);
        await initialDm.edit({
            content: firstQ.question,
            components
        });
        setTimeout(async () => {
            if (testProgressState.get(interaction.user.id)) {
                await initialDm.edit({
                    content: "You have been timed out",
                    components: []
                });
                clearStates(interaction.user.id);
            }
        }, 1500000 + (1000 * 60 * 10));
        return;
    } else {
        await initialDm.edit("There seems to be something wrong with my api");
        return;
    }
});

//general knowledge test
client.on("interactionCreate", async (interaction) => {

    if (!interaction.isButton()) return;
    if (interaction.customId != "start_general_test") return;
    await interaction.deferUpdate();

    const initialDm = await interaction.user.send("Please be patient while I make sure my api is awake...");

    const pingResponse = await dbPing();

    if (pingResponse.success) {
        const reasonPreventing = await preventedFromTesting(interaction.user.id, "G");
        if (reasonPreventing) {
            await initialDm.edit(reasonPreventing);
            return;
        };

        const qCopy = randomQuestions("G");
        qCopy.forEach(q => {
            q.options = scramble(q.options);
        });

        const firstQ = qCopy[0];
        qCopy.shift();
        personalisedQuestionsState.set(interaction.user.id, qCopy);
        testProgressState.set(interaction.user.id, {});
        backgroundProgressState.set(interaction.user.id, {
            userId: interaction.user.id,
            generalAnswers: []
        });

        timerState.set(interaction.user.id, { allotedTime: 1500000, startedAt: Date.now() });

        const components = createIQQuestionnaire(firstQ);
        await initialDm.edit({
            content: firstQ.question,
            components
        });
        setTimeout(async () => {
            if (testProgressState.get(interaction.user.id)) {
                await initialDm.edit({
                    content: "You have been timed out",
                    components: []
                });
                clearStates(interaction.user.id);
            }
        }, 1500000 + (1000 * 60 * 10));
        return;
    } else {
        await initialDm.edit("There seems to be something wrong with my api");
        return;
    };
});