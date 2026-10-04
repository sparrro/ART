import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import countries from "../data/hdiData.json";
import questions from "../data/questions.json";
import { paginate } from "./helpers";
import {
    questionType,
    countryType
} from "./types";

export const countryPages = paginate(countries);

export const createCountryMenu = (page: number) => {

    const menu = new StringSelectMenuBuilder()
    .setCustomId(`country_select_${page}`)
    .setPlaceholder("Choose your country")
    .addOptions(
        countryPages[page].map(country =>
            new StringSelectMenuOptionBuilder()
            .setLabel(country.country)
            .setValue(country.country)
        )
    );

    const menuRow = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(menu);

    const previous = new ButtonBuilder()
    .setCustomId(`country_previous_${page}`)
    .setLabel("Previous page")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(page == 0);

    const next = new ButtonBuilder()
    .setCustomId(`country_next_${page}`)
    .setLabel("Next page")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(page == countryPages.length - 1);

    const buttonRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(previous, next);

    return [menuRow, buttonRow];

};

export const createRegionMenu = (country: countryType, page: number) => {

    const regionPages = paginate(country.regions);

    const menu = new StringSelectMenuBuilder()
    .setCustomId(`region_select_${page}`)
    .setPlaceholder("Choose your region")
    .addOptions(
        regionPages[page].map(region =>
            new StringSelectMenuOptionBuilder()
            .setLabel(region.region)
            .setValue(region.region)
        )
    );

    const menuRow = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(menu);

    const previous = new ButtonBuilder()
    .setCustomId(`region_previous_${page}`)
    .setLabel("Previous page")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(page == 0);

    const next = new ButtonBuilder()
    .setCustomId(`region_next_${page}`)
    .setLabel("Next page")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(page == regionPages.length - 1);

    const buttonRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(previous, next);

    return [menuRow, buttonRow];

};


//test start buttons
export const createStartButtons = () => {

    const full = new ButtonBuilder()
    .setCustomId("start_full_test")
    .setLabel("Do the full test")
    .setStyle(ButtonStyle.Primary);
    
    const verbal = new ButtonBuilder()
    .setCustomId("start_verbal_test")
    .setLabel("Do verbal reasoning test")
    .setStyle(ButtonStyle.Secondary);

    const numerical = new ButtonBuilder()
    .setCustomId("start_numerical_test")
    .setLabel("Do numerical reasoning test")
    .setStyle(ButtonStyle.Secondary);

    const abstract = new ButtonBuilder()
    .setCustomId("start_abstract_test")
    .setLabel("Do abstract reasoning test")
    .setStyle(ButtonStyle.Secondary);

    const general = new ButtonBuilder()
    .setCustomId("start_general_test")
    .setLabel("Do general knowledge test")
    .setStyle(ButtonStyle.Secondary);

    const hdi = new ButtonBuilder()
    .setCustomId("start_hdi_recording")
    .setLabel("Record ")
    .setStyle(ButtonStyle.Secondary);

    const mainButtonRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(full);

    const secondaryButtonRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(verbal, numerical, abstract, general, hdi)

    return [mainButtonRow, secondaryButtonRow];
};





export const createIQQuestionnaire = (question: questionType) => {

    const menu = new StringSelectMenuBuilder()
    .setCustomId(question.question)
    .setPlaceholder("Choose the right answer")
    .addOptions(
        question.options.map(option =>
            new StringSelectMenuOptionBuilder()
            .setLabel(option.answer)
            .setValue(option.answer)
        )
    );

    const menuRow = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(menu)

    return [menuRow];
};