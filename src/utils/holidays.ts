import type { Holiday } from '../types/misc';
import { isSameDay, setDayOfTheWeek } from './date';

export const getVodafoneSpecificHolidays = (year: number) => {
    const vfSpecificHolidays: Holiday[] = [
        {
            name: 'Heiligabend',
            date: (() => {
                const date = new Date(year, 11, 24);
                return date;
            })(),
            vfSpecific: true,
            bridgeDay: false,
            halfDay: false,
        },
        {
            name: 'Silvester',
            date: (() => {
                const date = new Date(year, 11, 31);
                return date;
            })(),
            vfSpecific: true,
            bridgeDay: false,
            halfDay: false,
        }
    ];

    return vfSpecificHolidays;
};

export const getRoseMondayDate = (easterSundayDate: Date): Date => {
    const ashWednesday = new Date(easterSundayDate);
    ashWednesday.setDate(easterSundayDate.getDate() - 46);
    const roseMonday = new Date(ashWednesday);
    roseMonday.setDate(ashWednesday.getDate() - 2);

    return roseMonday;
};

export const isBridgeDayPossible = (date: Date, holidayDates: Date[]): boolean => {
    const counterDate = new Date(date);

    let workingDaysCounter = 0;

    for (let i = 1; i < 6; i++) {
        setDayOfTheWeek(counterDate, i);

        const isHoliday = holidayDates.some(holiday => isSameDay(counterDate, holiday));

        if (isHoliday) {
            if (workingDaysCounter === 1) {
                return true;
            }

            workingDaysCounter = 0;
        } else {
            workingDaysCounter++;
        }
    }

    if (workingDaysCounter === 1) {
        return true;
    }

    return false;
};