import { getDayOfYear } from '@itcoordinadora/time';

export const greenwichToColombia = (): Date => {
    const currentDate = new Date();
    return new Date(currentDate.setHours(currentDate.getHours() - 5));
};

export const buildKey = (): string => {
    return `${greenwichToColombia().getFullYear()}${getDayOfYear(greenwichToColombia()).toString().padStart(3, '0')}`;
};
