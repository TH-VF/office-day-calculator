export type Operator = '+' | '-';
export type InputUnit = 'days' | 'weeks';
export type InputType = 'working-day' | 'business-trip' | 'holiday' | 'sick';

export interface Holiday {
    name: string;
    date: Date;
    vfSpecific: boolean;
    bridgeDay: boolean;
    halfDay: boolean;
}
