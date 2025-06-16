export interface ResultSectionProps {
    workingDays: number;
    officeDays: number;
} 

export const ResultSection = (props: ResultSectionProps) => {
    const workingDays = props.workingDays || 0;
    const officeDays = props.officeDays || 0;

    return (
        <div className='pt-3 text-center'>
            <strong><output className='result'>{workingDays} {`Arbeitstag${workingDays === 1 ? '' : 'e'}`} = {officeDays} {`Bürotag${officeDays === 1 ? '' : 'e'}`}</output></strong>
        </div>
    );
};
