import { Options } from '../internal/types';

export type CamOverlayDrawingOptions = Options & {
    camera?: number | number[];
    zIndex?: number;
};

export type TMessage = {
    command: string;
    call_id?: number;
    params: unknown[];
};

export type TCairoResponse = {
    message: string;
    call_id: number;
};

export type TCairoCreateResponse = {
    var: string;
    call_id: number;
};

export type TUploadImageResponse = {
    var: string;
    width: number;
    height: number;
    call_id: number;
};

export type TErrorResponse = {
    error: string;
    call_id?: number;
};

export type TCoService = {
    id: number;
    enabled: number;
    schedule: string;
    name: string;
    identifier: string;
    cameraList: number[];
};

export type TCoServiceList = {
    services: TCoService[];
};

export type TAlign = 'A_RIGHT' | 'A_LEFT' | 'A_CENTER';
export type TextFit = 'TFM_SCALE' | 'TFM_TRUNCATE' | 'TFM_OVERFLOW';
export type TWriteTextParams = [string, string, number, number, number, number, TAlign, TextFit?];

export type TCODResponse = TCairoResponse | TCairoCreateResponse | TUploadImageResponse;
export type AsyncMessage = {
    resolve: (value: TCODResponse) => void;
    reject: (reason: Error) => void;
    sentTimestamp: number;
};
