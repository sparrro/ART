import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import countries from "../data/hdiData.json";
import { paginate } from "./helpers";

type countryType = {
    country: string,
    regions: {
        region: string,
        hdi: number
    }[]
};

const countryPages = paginate(countries);

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

