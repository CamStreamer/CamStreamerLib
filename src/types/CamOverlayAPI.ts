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

export type TImage = {
    name: string;
    path: string;
    storage: string;
};

export enum ImageType {
    PNG,
    JPEG,
}

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
