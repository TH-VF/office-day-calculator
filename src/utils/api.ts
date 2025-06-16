import type { Holiday } from '../types/misc';
import { getVodafoneSpecificHolidays, isBridgeDayPossible } from './holidays';

export const loadPublicHolidays = async (country: string, year: number): Promise<Holiday[]> => {
    const response = await fetch(`https://feiertage-api.de/api/?jahr=${year}&nur_land=${country}`);
    const responseJson = await response.json();
    const holidayNames = Object.keys(responseJson);
    const holidays = [];

    // let easterSundayDate;

    for (const holidayName of holidayNames) {
        const date = new Date(responseJson[holidayName].datum);

        // if (holidayName === 'Ostermontag') {
        //     easterSundayDate = new Date(date);
        //     easterSundayDate.setDate(easterSundayDate.getDate() - 1);
        // }

        holidays.push({
            name: holidayName,
            date,
            vfSpecific: false,
            bridgeDay: false,
            halfDay: false,
        });
    }

    const vfSpecificHolidays = getVodafoneSpecificHolidays(year);

    holidays.push(...vfSpecificHolidays);

    // if (easterSundayDate) {
    //     const roseMondayDate = getRoseMondayDate(easterSundayDate);

    //     holidays.push({
    //         name: 'Rosenmontag',
    //         date: roseMondayDate,
    //         vfSpecific: true,
    //         bridgeDay: false,
    //         halfDay: true,
    //     });
    // }

    const holidayDates = holidays.map(holiday => holiday.date);

    holidays.forEach(holiday => {
        // we don't have the holidays of previous or next year, so we have to set the bridgeDay property for silvester & new year ourself
        switch (holiday.name) {
            case 'Silvester': {
                const day = holiday.date.getDay();
                holiday.bridgeDay = day === 2;
                break;
            }
            case 'Neujahrstag': {
                const day = holiday.date.getDay();
                holiday.bridgeDay = day === 4;
                break;
            };
            default:
                holiday.bridgeDay = isBridgeDayPossible(holiday.date, holidayDates);
                break;
        }
    });

    holidays.sort((dayA, dayB) => dayA.date.getTime() - dayB.date.getTime());

    return holidays;
};