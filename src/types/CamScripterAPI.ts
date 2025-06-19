import { HttpOptions } from '../internal/common';

export type CamScripterOptions = HttpOptions;

export type TPackageInfoList = {
    storage: 'SD_CARD' | 'INTERNAL';
    manifest: {
        package_name: string;
        package_menu_name: string;
        package_version: string;
        vendor: string;
        required_camscripter_version: string;
        required_camscripter_rbi_version: string;
        ui_link: string;
    };
}[];

export type TStorageType = 'INTERNAL' | 'SD_CARD';
export type TStorage = {
    type: TStorageType;
    capacity_mb: number;
}[];

export type TNodeState = 'OK' | 'NOT_INSTALLED' | 'NOT_FOUND';
