export interface ResultSectionProps {
    workingDays: number;
    officeDays: number;
} 

export const ResultSection = (props: ResultSectionProps) => {
    const workingDays = props.workingDays || 0;
    const officeDays = props.officeDays || 0;
    const roundedOfficeDays = Math.round(officeDays);
    const roundedOfficeDaysToTwoDecimalPlaces = Math.round(officeDays * 100) / 100;

    return (
        <div className='pt-3 text-center'>
            <strong>
                <output className='result'>
                    {workingDays} {`Arbeitstag${workingDays === 1 ? '' : 'e'}`}
                    &nbsp;=&nbsp;
                    <span title={`${roundedOfficeDaysToTwoDecimalPlaces} Bürotag${roundedOfficeDays === 1 ? '' : 'e'}`}>{roundedOfficeDays} {`Bürotag${roundedOfficeDays === 1 ? '' : 'e'}`}</span>*
                </output>
            </strong>
            <div className='mt-2 fs-6'>
                <small>
                    *Berechnung ohne Gewähr. Dieses Tool ist nicht offiziell.
                </small>
            </div>
        </div>
    );
};
