import { useCallback, useState, type ChangeEvent, type InputEvent } from 'react';
import { getCurrentYear, calcOfficeDays } from './utils/date';
import type { InputType, InputUnit, Operator } from './types/misc';
import { InputSection, type InputSectionProps } from './components/InputSection';
import { ResultSection } from './components/ResultSection';
import { WorkingDaysAndHolidayList } from './components/WorkingDaysAndHolidayList';
import logo from './assets/New_VF_Icon_RGB_RED.svg'
import { countries, localStorageKeyCountry, localStorageKeySections, localStorageKeyWeeklyWorkingHours, localStorageKeyYear, localStoragePrefix } from './constants';
import styles from './styles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons';

class InputSectionModel {
    id: string;
    value: number | null;
    unit: InputUnit | null;
    type: InputType | null;
    operator: Operator | null;

    constructor() {
        this.id = `section-${Math.floor(Math.random() * 1e10)}`;
        this.value = null;
        this.unit = null;
        this.type = null;
        this.operator = null;
    }
}

const getDaysFromSection = (section: InputSectionModel): number => {
    switch (section.unit) {
        case 'days':
            return section.value || 0;
        case 'weeks':
            return (section.value || 0) * 5;
        default:
            return 0;
    }
};

const calcWorkingDays = (sections: InputSectionModel[]) => {
    let workingDays = 0;

    sections.forEach((section, index) => {
        const daysFromSection = getDaysFromSection(section);

        if (index !== 0 && section.operator === '-') {
            // Business-Trips are not deducted from the working days.
            // Instead, they are directly deducted from the resulting office days.

            if (section.type !== 'business-trip') {
                workingDays -= daysFromSection;
            }
        }
        else {
            // Sick leaves and holidays are not added to the working days

            if (section.type !== 'holiday' && section.type !== 'sick') {   
                workingDays += daysFromSection;
            }
        }
    });

    return workingDays;
};

const calcBusinessTripDays = (sections: InputSectionModel[]) => {
    let businessTripDays = 0;

    sections.forEach(section => {
        if (section.type === 'business-trip') {
            const daysFromSection = getDaysFromSection(section);
            businessTripDays += daysFromSection;
        }
    });

    return businessTripDays;
};

const getInitialSections = (): InputSectionModel[] => {
    const createDefaultSections = () => [new InputSectionModel()];

    // return createDefaultSections();

    const sectionData = localStorage.getItem(localStorageKeySections);

    if (!sectionData) {
        return createDefaultSections();
    }

    let sections: InputSectionModel[];
    
    try {
        sections = JSON.parse(sectionData) as InputSectionModel[];
    }
    catch {
        return createDefaultSections();
    }

    return sections;
};

const getInitialYear = () => parseInt(localStorage.getItem(localStorageKeyYear) || '', 10) || getCurrentYear();
const getInitialCountry = () => localStorage.getItem(localStorageKeyCountry) || 'NW';
const getInitialWeeklyWorkingHours = () => parseFloat(localStorage.getItem(localStorageKeyWeeklyWorkingHours) || '0') || 40;

const App = () => {
    const [sections, setSections] = useState(getInitialSections);
    const [year, setYear] = useState(getInitialYear);
    const [country, setCountry] = useState(getInitialCountry);
    const [weeklyWorkingHours, setWeeklyWorkingHours] = useState(getInitialWeeklyWorkingHours);

    const setAndSaveSections = (newSections: InputSectionModel[]) => {
        setSections(newSections);
        localStorage.setItem(localStorageKeySections, JSON.stringify(newSections));
    };

    const handleSectionChange = useCallback((section: InputSectionModel, val: Parameters<InputSectionProps['onChange']>[0]) => {
        const sectionIndex = sections.indexOf(section);
        const newSections = [...sections];

        newSections[sectionIndex] = {
            ...newSections[sectionIndex],
            value: val.value,
            unit: val.unit,
            type: val.type,
            operator: val.operator,
        };

        setAndSaveSections(newSections);
    }, [sections]);

    const addSection = useCallback(() => {
        const newSections = [...sections];
        newSections.push(new InputSectionModel());
        setAndSaveSections(newSections);
    }, [sections]);

    const deleteSection = useCallback((index: number) => {
        const newSections = [...sections];
        newSections.splice(index, 1);
        setAndSaveSections(newSections);
    }, [sections]);

    const workingDays = calcWorkingDays(sections);
    const businessTripDays = calcBusinessTripDays(sections);
    const officeDays = calcOfficeDays(workingDays, businessTripDays, weeklyWorkingHours);

    const handleMonthSelected = useCallback((index: number, workingDays: number) => {
        if (index === -1) {
            return;
        }

        if (sections.length > 1) {
            // user has already made changes (added custom input sections, so we don't want to modify his work)
            return;
        }

        const newSections = [...sections];

        newSections[0].value = workingDays;
        newSections[0].unit = 'days';
        newSections[0].type = 'working-day';

        setSections(newSections);
    }, [sections]);

    const handleYearChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const year = e.currentTarget!.value;
        const yearAsNumber = parseInt(e.currentTarget!.value, 10);
        localStorage.setItem(localStorageKeyYear, year.toString());
        setYear(yearAsNumber);
    };

    const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const country = e.currentTarget!.value;
        localStorage.setItem(localStorageKeyCountry, country);
        setCountry(country);
    };

    const handleWeeklyWorkingHoursChange = (e: InputEvent<HTMLInputElement>) => {
        const weeklyWorkingHours = e.currentTarget.valueAsNumber;
        localStorage.setItem(localStorageKeyWeeklyWorkingHours, weeklyWorkingHours.toString());
        setWeeklyWorkingHours(weeklyWorkingHours);
    };

    const currentYear = getCurrentYear();

    const years = [
        currentYear - 1,
        currentYear,
        currentYear + 1,
    ];

    const handleResetButtonClick = () => {
        const confirmed = window.confirm('Alle Eingaben zurücksetzen?');

        if (!confirmed) {
            return;
        }

        const localStorageKeys = Object.keys(localStorage).filter(key => key.startsWith(localStoragePrefix));

        localStorageKeys.forEach(localStorageKey => {
            localStorage.removeItem(localStorageKey);
        });

        location.reload();
    };

    return (
        <>
            <div className='py-5'>
                <div className='container'>
                    <div className='row gy-4'>
                        <div className='col-12 col-lg-6'>
                            <section className={`${styles['blur-background']} p-3 px-lg-4 py-lg-4 px-xl-5 rounded-4`}>
                                <div className='d-flex'>
                                    <h1 className='d-flex fw-normal align-items-center'>
                                        <img
                                            className={`${styles['logo']} me-2`}
                                            src={logo}
                                            alt=''
                                            aria-hidden='true'
                                        />
                                        Bürotage-Rechner
                                    </h1>
                                    <button className='btn px-0 ms-auto border-0' title='Alle Eingaben zurücksetzen' onClick={handleResetButtonClick}>
                                        <FontAwesomeIcon icon={faRotateLeft} size='sm' />
                                    </button>
                                </div>
                                <div className={`${styles['config-section']} py-4 row`}>
                                    <div className='col'>
                                        <label className='d-block'>
                                            Bundesland
                                            <select className='form-select form-select-sm rounded-2' value={country} onChange={handleCountryChange}>
                                                {countries.map(country => <option key={country.value} value={country.value}>{country.label}</option>)}
                                            </select>
                                        </label>
                                    </div>
                                    <div className='col'>
                                        <label className='d-block'>
                                            Jahr
                                            <select className='form-select form-select-sm rounded-2' value={year} onChange={handleYearChange}>
                                                {years.map(year => <option key={year} value={year}>{year}</option>)}
                                            </select>
                                        </label>
                                    </div>
                                    <div className='col'>
                                        <label className='d-block'>
                                            Arbeitszeit
                                            <input
                                                className='form-control form-control-sm rounded-2'
                                                type='number'
                                                min='1'
                                                step='0.5'
                                                value={weeklyWorkingHours || ''}
                                                onInput={handleWeeklyWorkingHoursChange}
                                            />
                                        </label>
                                    </div>
                                </div>
                                {sections.map((section, index) => (
                                    <InputSection
                                        key={section.id}
                                        index={index}
                                        count={sections.length}
                                        isFirst={index === 0}
                                        isLast={index === sections.length - 1}
                                        initialValue={section.value}
                                        initialUnit={section.unit}
                                        initialType={section.type}
                                        onChange={val => handleSectionChange(section, val)}
                                        onAddSection={addSection}
                                        onDeleteSection={() => deleteSection(index)}
                                    />)
                                )}
                                <ResultSection workingDays={workingDays} officeDays={officeDays} />
                            </section>
                        </div>
                        <div className='col-12 col-lg-6'>
                            <WorkingDaysAndHolidayList country={country} year={year} onMonthSelected={handleMonthSelected} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}



export default App;
