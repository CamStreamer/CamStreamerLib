import { HttpOptions } from '../internal/common';

export type CamOverlayOptions = HttpOptions;

export type TField = {
    field_name: string;
    text: string;
    color?: string;
};

export type TService = Record<string, any>;

export type TServiceList = {
    services: TService[];
};

export type TNetworkCameraList = {
    name: string;
    ip: string;
}[];

export type TFileType = 'image' | 'font';

export type TFile = {
    name: string;
    path: string;
    storage: string;
};

export enum ImageType {
    PNG,
    JPEG,
}

export type TStorage = [
    {
        type: 'SD0';
        state: 'SD Card';
    },
    {
        type: 'flash';
        state: `Internal Memory (Available Space ${string})`;
    }
];

export type TImageStorage = [
    ...TStorage,
    {
        type: 'samba';
        state: 'Microsoft Network Share';
    },
    {
        type: 'url';
        state: 'URL';
    },
    {
        type: 'ftp';
        state: 'FTP';
    }
];

export type TCoordinates =
    | 'top_left'
    | 'top_right'
    | 'top'
    | 'bottom_left'
    | 'bottom_right'
    | 'bottom'
    | 'left'
    | 'right'
    | 'center'
    | '';
