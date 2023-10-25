export const pluralizeNoun = (count: number, noun: string, suffix = 's') =>
    `${count} ${noun}${count > 1 ? suffix : ''}`
