export const getCurrentYear = () => new Date().getFullYear();
export const getCurrentMonth = () => new Date().getMonth();

export const getMonthName = (month: number) => {
    const date = new Date();

    // set day of the month to mid of the month
    // to avoid shifting to a different month
    // due to number of days in month or zimezones
    date.setDate(15);
    date.setMonth(month);

    return date.toLocaleString('de-DE', { month: 'long' });
};

export const getMonthNames = () => Array.from({ length: 12 }, (_el, index) => getMonthName(index));

export const formatDate = (date: Date) => date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
});

export const isSameDay = (dateA: Date, dateB: Date) =>
    dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth() && dateA.getDate() === dateB.getDate();

export const setDayOfTheWeek = (date: Date, day: number) => {
    const currentDay = date.getDay();
    const dayDiff = day - currentDay;

    date.setDate(date.getDate() + dayDiff);

    return date;
};

export const workingDaysToOfficeDays = (workingDays: number, weeklyWorkingHours: number) => {
    // according to HR all contracts >= 35 hours are treated as 40 hours in terms of office days
    const actualWeeklyWorkingHours = weeklyWorkingHours >= 35 ? 40 : (weeklyWorkingHours || 0);
    return Math.round((2 / 40 * actualWeeklyWorkingHours) / 5 * workingDays);
};

export const getWorkingDaysInMonth = (year: number, month: number, holidayDates: Date[]) => {
    const counterDate = new Date();

    counterDate.setDate(1);
    counterDate.setFullYear(year, month);

    let workingDays = 0;

    while (counterDate.getMonth() === month) {
        const day = counterDate.getDay();

        if (day > 0 && day < 6) {
            // days is between monday and friday

            const isHoliday = holidayDates.some(holiday => isSameDay(holiday, counterDate));

            if (!isHoliday) {
                workingDays++;
            }
        }

        counterDate.setDate(counterDate.getDate() + 1);
    }

    return workingDays;
};