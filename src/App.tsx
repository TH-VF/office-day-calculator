import { useCallback, useState, type ChangeEvent, type InputEvent } from 'react';
import { getCurrentYear, workingDaysToOfficeDays } from './utils/date';
import type { Operator } from './types/misc';
import { InputSection, type InputSectionProps } from './components/InputSection';
import { ResultSection } from './components/ResultSection';
import { WorkingDaysAndHolidayList } from './components/WorkingDaysAndHolidayList';
import logo from './assets/New_VF_Icon_RGB_RED.svg'
import { countries } from './constants';
import styles from './styles.module.css';

class InputSectionModel {
    id: string;
    value: number | null;
    unit: string | null;
    operator: Operator | null;

    constructor() {
        this.id = `section-${Math.floor(Math.random() * 1e10)}`;
        this.value = null;
        this.unit = null;
        this.operator = null;
    }
}

const getWorkingDaysFromSection = (section: InputSectionModel): number => {
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
        const workingDaysFromSection = getWorkingDaysFromSection(section);

        if (index !== 0 && section.operator === '-') {
            workingDays -= workingDaysFromSection;
        }
        else {
            workingDays += workingDaysFromSection;
        }
    });

    return workingDays;
};

const App = () => {
    const currentYear = getCurrentYear();
    const [sections, setSections] = useState([new InputSectionModel()]);
    const [year, setYear] = useState(parseInt(localStorage.getItem('odc-year') || '', 10) || currentYear);
    const [country, setCountry] = useState(localStorage.getItem('odc-country') || 'NW');
    const [weeklyWorkingHours, setWeeklyWorkingHours] = useState(parseFloat(localStorage.getItem('odc-weekly-working-hours') || '0') || 40);

    const handleSectionChange = useCallback((section: InputSectionModel, val: Parameters<InputSectionProps['onChange']>[0]) => {
        const sectionIndex = sections.indexOf(section);
        const newSections = [...sections];

        newSections[sectionIndex].value = val.value;
        newSections[sectionIndex].unit = val.unit;
        newSections[sectionIndex].operator = val.operator;

        setSections(newSections);
    }, [sections]);

    const addSection = useCallback(() => {
        const newSections = [...sections];
        newSections.push(new InputSectionModel());
        setSections(newSections);
    }, [sections]);

    const deleteSection = useCallback((index: number) => {
        const newSections = [...sections];
        newSections.splice(index, 1);
        setSections(newSections);
    }, [sections]);

    const workingDays = calcWorkingDays(sections);
    const officeDays = workingDaysToOfficeDays(workingDays, weeklyWorkingHours);

    const handleMonthSelected = useCallback((index: number, workingDays: number) => {
        if (index === -1) {
            return;
        }

        const newSections = [...sections];
        newSections[0].value = workingDays;
        newSections[0].unit = 'days';
        setSections(newSections);
    }, [sections]);

    const handleYearChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const year = e.currentTarget!.value;
        const yearAsNumber = parseInt(e.currentTarget!.value, 10);
        localStorage.setItem('odc-year', year.toString());
        setYear(yearAsNumber);
    };

    const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const country = e.currentTarget!.value;
        localStorage.setItem('odc-country', country);
        setCountry(country);
    };

    const handleWeeklyWorkingHoursChange = (e: InputEvent<HTMLInputElement>) => {
        const weeklyWorkingHours = e.currentTarget.valueAsNumber;
        localStorage.setItem('odc-weekly-working-hours', weeklyWorkingHours.toString());
        setWeeklyWorkingHours(weeklyWorkingHours);
    };

    const years = [
        currentYear - 1,
        currentYear,
        currentYear + 1,
    ];

    return (
        <>
            <div className='py-5'>
                <div className='container'>
                    <div className='row gy-4'>
                        <div className='col-12 col-lg-6'>
                            <section className={`${styles['blur-background']} p-3 px-lg-4 py-lg-4 px-xl-5 rounded-4`}>
                                <div className='d-flex'>
                                    <h1 className='d-flex fw-light align-items-center'>
                                        <img
                                            className={`${styles['logo']} me-2`}
                                            src={logo}
                                            alt=''
                                            aria-hidden='true'
                                        />
                                        Bürotage-Rechner
                                    </h1>
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
