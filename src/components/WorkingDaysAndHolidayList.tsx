import { useEffect, useState } from 'react';
import { formatDate, getCurrentMonth, getMonthName, getMonthNames, getWorkingDaysInMonth } from '../utils/date';
import { loadPublicHolidays } from '../utils/api';
import type { Holiday } from '../types/misc';
import styles from '../styles.module.css';

export interface WorkingDaysAndHolidayListProps {
    country: string;
    year: number;
    onMonthSelected: (selectedMonth: number, workingDaysInMonth: number) => void;
}

export const WorkingDaysAndHolidayList = ({
    country,
    year,
    onMonthSelected,
}: WorkingDaysAndHolidayListProps) => {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const currentMonth = getCurrentMonth();
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    useEffect(() => {
        const loadHolidays = async () => {
            let holidays: Holiday[];

            try {
                holidays = await loadPublicHolidays(country, year);
                // console.log('holidays', holidays);
            } catch (error) {
                console.error('failed to load holidays', error);
                setErrorMessage(`${error}`);
                return;
            }

            if (!holidays.length) {
                setErrorMessage('No holidays received');

                return;
            }

            setHolidays(holidays);
        };

        loadHolidays();
    }, [country, year]);

    useEffect(() => {
        const holidayDates = holidays.map(holiday => holiday.date);
        const workingDaysInMonth = getWorkingDaysInMonth(year, selectedMonth, holidayDates);
        onMonthSelected(selectedMonth, workingDaysInMonth);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        selectedMonth,
        holidays,
    ]);

    if (errorMessage) {
        return (
            <div className='alert alert-danger' role='alert'>
                Feiertage konnten nicht geladen werden:
                <br/>
                {errorMessage}
            </div>
        );
    }

    if (!holidays.length) {
        return (
            <div>Lade...</div>
        );
    }

    const holidayDates = holidays.map(holiday => holiday.date);

    const handleMonthClick = (index: number) => {
        const isAlreadySelected = index === selectedMonth;
        setSelectedMonth(isAlreadySelected ? -1 : index);

        if (!isAlreadySelected) {
            const workingDaysInMonth = getWorkingDaysInMonth(year, index, holidayDates);
            onMonthSelected(index, workingDaysInMonth);
        }
    };

    const holidaysByMonth = holidays.filter(holiday => selectedMonth === -1 ? true : holiday.date.getMonth() === selectedMonth);

    let workingDaysTotal = 0;

    const monthNames = getMonthNames();

    const monthes = monthNames.map((monthName, index) => {
        const workingDaysInMonth = getWorkingDaysInMonth(year, index, holidayDates);
        workingDaysTotal += workingDaysInMonth;

        return (
            <button
                className={`list-group-item list-group-item-action ${selectedMonth === index ? 'active' : (currentMonth === index ? 'list-group-item-dark' : '')}`}
                onClick={() => handleMonthClick(index)}
                key={monthName}
            >
                {monthName}: {workingDaysInMonth}
            </button>
        );
    });

    return (
        <div className='row gy-4'>
            <div className='col-12 col-lg-6'>
                <div className={`${styles['blur-background']} p-3 rounded-4`}>
                    <h2 className='fw-normal' title={`${workingDaysTotal} Arbeitstage in ${year}`}>Arbeitstage {year}</h2>
                    <div className='list-group list-group-flush'>
                        {monthes}
                    </div>
                </div>
            </div>
            <div className='col-12 col-lg-6'>
                <div className={`${styles['blur-background']} p-3 rounded-4`}>
                    <h2 className='fw-normal' title={`${selectedMonth === -1 ? '' : `${holidaysByMonth.length} Feiertage im ${getMonthName(selectedMonth)}, `}${holidays.length} Feiertage in ${year}`}>Feiertage</h2>
                    {
                        holidaysByMonth.length
                            ? (
                                <ul className='list-group list-group-flush'>
                                    {holidaysByMonth.map(holiday => (
                                        <li key={holiday.name} className='list-group-item'>
                                            <span className='me-1'>{formatDate(holiday.date)}
                                                &nbsp;–&nbsp;
                                                {holiday.name}
                                            </span>
                                            {holiday.vfSpecific && <span className='badge text-bg-danger rounded-pill me-1'>Vodafone</span>}
                                            {holiday.halfDay && <span className='badge text-bg-warning rounded-pill me-1'>Halber Tag</span>}
                                            {holiday.bridgeDay && <span className='badge text-bg-success rounded-pill me-1'>Brückentag</span>}
                                        </li>
                                    ))}
                                </ul>
                            )
                            : (

                                <div className='list-group list-group-flush'>
                                    <p className='list-group-item mb-0'>
                                        Keine Feiertage im {monthNames[selectedMonth]}
                                    </p>
                                </div>
                            )
                    }
                </div>
            </div>
        </div>
    );
};
