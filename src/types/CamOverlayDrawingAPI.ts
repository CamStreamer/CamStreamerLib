import { WsOptions } from '../internal/types';

export type CamOverlayDrawingOptions = WsOptions & {
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

export type TService = {
    id: number;
    enabled: number;
    schedule: string;
    name: string;
    identifier: string;
    cameraList: number[];
};

export type TServiceList = {
    services: TService[];
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

export interface CamOverlayDrawingAPI {
    on(event: 'open', listener: () => void): this;
    on(event: 'close', listener: () => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: 'message', listener: (msg: string) => void): this;

    emit(event: 'open'): boolean;
    emit(event: 'close'): boolean;
    emit(event: 'error', err: Error): boolean;
    emit(event: 'message', msg: string): boolean;
}
