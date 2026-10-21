export const slugify = (value: string): string => 
    value
        .trim()
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');


export const normalizeAttributeKey = (value: string): string => 
    value.trim().toLowerCase().replace(/\s+/g, '_');

export const normalizeSkuPrefix = (value: string): string =>
    value.trim().toUpperCase();

export const isValidPriceRange = (min: number, max: number): boolean => 
    Number.isFinite(min) && Number.isFinite(max) && min >= 0 && max > min;