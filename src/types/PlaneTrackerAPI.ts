export type TImportDataType = 'MAP_DATA' | 'SERVER_DATA' | 'ALL';
export type TExportDataType = 'NIGHT_SKY_CALIBRATION_DATA' | 'ALL';

export type TApiUser = {
    userId: string;
    userName: string;
    userPriority: number;
};

export type ICAO = string;
