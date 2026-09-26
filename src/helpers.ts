export const paginate = <T>(array: T[]): T[][] => {
    const pages: T[][] = [];
    for (let i = 0; i < array.length; i += 25) {
        pages.push(array.slice(i, i + 25));
    };
    return pages;
};

export const scramble = <T>(a: T[]) => {
    const copyA: T[] = a.slice();
    for (let i = 0; i < copyA.length; i++) {
        const current = copyA[i];
        const random = Math.floor(Math.random() * (i + 1));
        copyA[i] = copyA[random];
        copyA[random] = current;
    };
    return copyA;
};