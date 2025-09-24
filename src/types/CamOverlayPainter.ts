import { CamOverlayDrawingAPI } from '../CamOverlayDrawingAPI';
import { COORD } from '../CamOverlayPainter/Painter';
import { TAlign, TCairoCreateResponse, TUploadImageResponse } from './CamOverlayDrawingAPI';

export type TRgb = [number, number, number];
export type TRgba = [number, number, number, number];
export type TTmf = 'TFM_OVERFLOW' | 'TFM_SCALE' | 'TFM_TRUNCATE';
export type TObjectFitType = 'fill' | 'fit' | 'none';
export type TFrameOptions = {
    enabled?: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    text?: string;
    fontColor?: TRgb;
    font?: string;
    bgColor?: TRgba;
    bgImage?: string;
    bgType?: TObjectFitType;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: TRgba;
    customDraw?: TDrawingCallback;
    layer?: number;
};

export type TFrameInfo = {
    width: number;
    height: number;
};
export type TDrawingCallback = (cod: CamOverlayDrawingAPI, cairo: string, info: TFrameInfo) => Promise<void>;

export type TFrame = {
    x: number;
    y: number;
    width: number;
    height: number;
};
export type TText = {
    text: string;
    textAlign: TAlign;
    textType: TTmf;
    fontColor: TRgb;
    font: TCairoCreateResponse | undefined;
    fontName: string | undefined;
};
export type TBg = {
    bgColor: TRgba | undefined;
    bgImage: TUploadImageResponse | undefined;
    bgImageName: string | undefined;
    bgType: TObjectFitType | undefined;
};
export type TBorder = {
    borderRadius: number;
    borderWidth: number;
    borderColor: TRgba;
};

export interface Frame {
    on(event: 'open', listener: () => void): this;
    on(event: 'close', listener: () => void): this;
    on(event: 'layoutChanged', listener: () => void): this;

    emit(event: 'open'): boolean;
    emit(event: 'close'): boolean;
    emit(event: 'layoutChanged'): boolean;
}

export type TCoAlignment = keyof typeof COORD;
export type TPainterOptions = TFrameOptions & {
    screenWidth: number;
    screenHeight: number;
    coAlignment: TCoAlignment;
};

export type TLayer = {
    layer: number;
    surfaceCache?: string;
    cairoCache?: string;
};
