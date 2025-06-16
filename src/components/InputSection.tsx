import { useEffect, useState, type ChangeEvent, type InputEvent } from 'react';
import type { Operator } from '../types/misc';
import styles from '../styles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMinus,
    faPlus,
} from '@fortawesome/free-solid-svg-icons';

export interface InputSectionProps {
    index: number;
    count: number;
    isFirst: boolean;
    isLast: boolean;
    initialValue: number | null;
    initialUnit: string | null;
    onChange: (args: {
        value: number;
        unit: string;
        operator: Operator;
    }) => void;
    onAddSection: () => void;
    onDeleteSection: () => void;
}

export const InputSection = ({
    index,
    count,
    isFirst,
    isLast,
    initialValue,
    initialUnit,
    onChange,
    onAddSection,
    onDeleteSection,
}: InputSectionProps) => {
    const [value, setValue] = useState(isFirst ? (initialValue || 20) : 1);
    const [unit, setUnit] = useState(isFirst ? (initialUnit || 'days') : 'weeks');
    const [operator, setOperator] = useState<Operator>(isFirst ? '+' : '-');

    const handleOperatorChange = (e: ChangeEvent<HTMLInputElement>) => {
        setOperator(e.currentTarget.value as Operator);
    };

    const handleValueChange = (e: InputEvent<HTMLInputElement>) => {
        setValue(e.currentTarget.valueAsNumber);
    };

    const handleUnitChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setUnit(e.currentTarget.value);
    };

    useEffect(() => {
        onChange({
            value,
            unit,
            operator,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        value,
        unit,
        operator,
    ]);

    useEffect(() => {
        if (initialValue) {
            setValue(initialValue);
        }

        if (initialUnit) {
            setUnit(initialUnit);
        }
    }, [
        initialValue,
        initialUnit,
    ]);


    return (
        <div className={`${styles['input-section']} py-4`}>
            {!isFirst && (
                <div className={`btn-group ${styles['btn-group-operator']}`}>
                    <input
                        id={`input-opterator-plus-${index}`}
                        type='radio'
                        name={`input-opterator-${index}`}
                        className='btn-check'
                        value='+'
                        checked={operator === '+'}
                        onChange={handleOperatorChange}
                    />
                    <label
                        className={`${styles['btn-operator']} btn btn-secondary p-0 rounded-1 rounded-end-0`}
                        htmlFor={`input-opterator-plus-${index}`}
                    >
                        <FontAwesomeIcon icon={faPlus} size='xs' />
                    </label>
                    <input
                        id={`input-opterator-minus-${index}`}
                        type='radio'
                        name={`input-opterator-${index}`}
                        className='btn-check'
                        value='-'
                        checked={operator === '-'}
                        onChange={handleOperatorChange}
                    />
                    <label
                        className={`${styles['btn-operator']} btn btn-secondary p-0 rounded-1 rounded-start-0`}
                        htmlFor={`input-opterator-minus-${index}`}
                    >
                        <FontAwesomeIcon icon={faMinus} size='xs' />
                    </label>
                </div>
            )}
            <div className='input-group'>
                <input
                    className='form-control input'
                    type='number'
                    min='1'
                    value={value || ''}
                    onInput={handleValueChange}
                />
                <select
                    className='form-select'
                    aria-label='Default select example'
                    value={unit}
                    onChange={handleUnitChange}
                >
                    <option value='days'>{value === 1 ? 'Tag' : 'Tage'}</option>
                    <option value='weeks'>{value === 1 ? 'Woche' : 'Wochen'}</option>
                </select>
                <div className='btn-group-vertical rounded-end-2 overflow-hidden'>
                    {count > 1 && <button className='btn btn-secondary px-2 py-0 rounded-0' onClick={onDeleteSection} title='Eingabebereich löschen'><FontAwesomeIcon className='d-block' icon={faMinus} size='xs' /></button>}
                    {isLast && index < 5 && <button className='btn btn-secondary px-2 py-0 rounded-0' onClick={onAddSection} title='Weiteren Eingabebereich hinzufügen'><FontAwesomeIcon className='d-block' icon={faPlus} size='xs' /></button>}
                </div>
            </div>
        </div>
    );
};
