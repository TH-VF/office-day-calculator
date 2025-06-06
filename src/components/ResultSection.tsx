export interface ResultSectionProps {
    workingDays: number;
    officeDays: number;
} 

export const ResultSection = ({
    workingDays,
    officeDays
}: ResultSectionProps) => {
    return (
        <div className='p-2 text-center'>
            <strong><output className='result'>{workingDays || 0} Arbeitstage = {officeDays || 0} Bürotage</output></strong>
        </div>
    );
};
