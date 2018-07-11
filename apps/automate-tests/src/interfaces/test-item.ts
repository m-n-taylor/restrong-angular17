export interface ITestItem {
    title?: string;
    url?: string;
    response?: string;
    busy?: boolean;
    success?: boolean;
    showDetails?: boolean;
    showResponse?: boolean;
    env?: string;
    startTime?: number;
    endTime?: number;
    passList?: Array<string>;
    failList?: Array<string>;
    defaultOrder?: number;
}