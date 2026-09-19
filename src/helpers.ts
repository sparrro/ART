export const paginate = <T>(array: T[]): T[][] => {
    const pages: T[][] = [];
    for (let i = 0; i < array.length; i += 25) {
        pages.push(array.slice(i, i + 25));
    };
    return pages;
};