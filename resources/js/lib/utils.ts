import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs));
};

export const formatDistanceToNow = (date: Date) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(Math.round((date.getTime() - Date.now()) / 1000 / 60 / 60 / 24), 'day');
};
