export type Operator = '+' | '-';

export interface Holiday {
    name: string;
    date: Date;
    vfSpecific: boolean;
    bridgeDay: boolean;
    halfDay: boolean;
}
