import { CamOverlayDrawingAPI, TAlign, TUploadImageResponse } from '../CamOverlayDrawingAPI';
import ResourceManager from './ResourceManager';

export type TRgb = [number, number, number];
export type TRgba = [number, number, number, number];
export type TTmf = 'TFM_OVERFLOW' | 'TFM_SCALE' | 'TFM_TRUNCATE';
export type TObjectFitType = 'fill' | 'fit' | 'none';
export type FrameOptions = {
    x: number;
    y: number;
    width: number;
    height: number;
    enabled?: boolean;

    bgImage?: string;
    text?: string;
    fontColor?: TRgb;
    bgColor?: TRgba;
    bgType?: TObjectFitType;
};

export type TFrameInfo = {
    width: number;
    height: number;
};
export type TDrawingCallback = (cod: CamOverlayDrawingAPI, cairo: string, info: TFrameInfo) => Promise<void>;

export default class Frame {
    protected posX: number;
    protected posY: number;
    protected width: number;
    protected height: number;
    protected enabled: boolean;

    private text = '';
    private align: TAlign = 'A_LEFT';
    private textType: TTmf = 'TFM_OVERFLOW';
    private fontColor: TRgb;
    private fontName?: string;

    private bgColor?: TRgba;
    private bgImage?: string | TUploadImageResponse;
    private bgType?: TObjectFitType;

    protected children = new Array<Frame>();

    constructor(opt: FrameOptions, private customDraw?: TDrawingCallback) {
        this.posX = opt.x;
        this.posY = opt.y;
        this.width = opt.width;
        this.height = opt.height;
        this.enabled = opt.enabled ?? true;

        this.setText(opt.text ?? '', 'A_LEFT');
        this.fontColor = opt.fontColor ?? [1.0, 1.0, 1.0];
        this.bgColor = opt.bgColor; // RGBA
        this.bgImage = opt.bgImage;
        this.bgType = opt.bgType;
    }

    //  -------------------------------
    //      Frame's content setting
    //  -------------------------------
    setFramePosition(x: number, y: number) {
        this.posX = x;
        this.posY = y;
    }
    setFrameSize(width: number, height: number) {
        this.width = width;
        this.height = height;
    }
    setText(text: string, align: TAlign, textType: TTmf = 'TFM_OVERFLOW', color?: TRgb): void {
        this.text = text;
        this.align = align;
        this.textType = textType;
        if (color) {
            this.fontColor = color;
        }
    }
    setFont(fontName: string): void {
        this.fontName = fontName;
    }
    setBgColor(color: TRgba): void {
        this.bgColor = color;
    }
    setBgImage(imageName: string, type: TObjectFitType = 'fit'): void {
        this.bgImage = imageName;
        this.bgType = type;
    }
    setBgImageData(imageData: TUploadImageResponse, type: TObjectFitType = 'fit') {
        this.bgImage = imageData;
        this.bgType = type;
    }
    setCustomDraw(customDraw: TDrawingCallback) {
        this.customDraw = customDraw;
    }
    clear(): void {
        this.text = '';
        this.align = 'A_LEFT';
        this.fontColor = [1.0, 1.0, 1.0];
        this.bgColor = undefined;
        this.bgImage = undefined;
    }
    insert(...frames: Frame[]): void {
        this.children.push(...frames); // Order of insertion is order of rendering
    }

    //  ------------------------
    //      Frame displaying
    //  ------------------------
    enable() {
        this.enabled = true;
    }
    disable() {
        this.enabled = false;
    }

    public async displayImage(
        cod: CamOverlayDrawingAPI,
        rm: ResourceManager,
        cairo: string,
        ppX: number,
        ppY: number,
        scale = 1
    ) {
        if (this.enabled) {
            ppX += this.posX;
            ppY += this.posY;
            await this.displayOwnImage(cod, rm, cairo, ppX, ppY, scale);
            for (const child of this.children) {
                await child.displayImage(cod, rm, cairo, ppX, ppY, scale);
            }
        }
    }
    protected async displayOwnImage(
        cod: CamOverlayDrawingAPI,
        rm: ResourceManager,
        cairo: string,
        ppX: number,
        ppY: number,
        scale: number
    ) {
        const promises = new Array<Promise<unknown>>();

        if (this.fontName !== undefined) {
            const fontData = await rm.font(this.fontName);
            promises.push(cod.cairo('cairo_set_font_face', cairo, fontData.var));
        } else {
            promises.push(cod.cairo('cairo_set_font_face', cairo, 'NULL'));
        }
        if (this.bgColor !== undefined) {
            promises.push(this.drawFrame(cod, cairo, scale, ppX, ppY));
        }
        if (this.bgImage !== undefined) {
            promises.push(this.drawImage(cod, rm, cairo, scale, ppX, ppY));
        }
        if (this.text) {
            promises.push(this.drawText(cod, cairo, scale, ppX, ppY));
        }
        if (this.customDraw) {
            promises.push(cod.cairo('cairo_identity_matrix', cairo));
            promises.push(cod.cairo('cairo_translate', cairo, scale * ppX, scale * ppY));
            promises.push(cod.cairo('cairo_scale', cairo, scale, scale));
            promises.push(this.customDraw(cod, cairo, { width: this.width, height: this.height }));
        }

        await Promise.all(promises);
    }

    private async drawFrame(cod: CamOverlayDrawingAPI, cairo: string, scale: number, ppX: number, ppY: number) {
        if (this.bgColor) {
            const promises = [
                cod.cairo('cairo_identity_matrix', cairo),
                cod.cairo('cairo_translate', cairo, scale * ppX, scale * ppY),
                cod.cairo('cairo_scale', cairo, scale, scale),
                cod.cairo(
                    'cairo_set_source_rgba',
                    cairo,
                    this.bgColor[0],
                    this.bgColor[1],
                    this.bgColor[2],
                    this.bgColor[3]
                ),
                cod.cairo('cairo_rectangle', cairo, 0, 0, this.width, this.height),
                cod.cairo('cairo_fill', cairo),
                cod.cairo('cairo_stroke', cairo),
            ];
            await Promise.all(promises);
        } else {
            throw new Error('Colour of this frame is undefined.');
        }
    }
    private async drawImage(
        cod: CamOverlayDrawingAPI,
        rm: ResourceManager,
        cairo: string,
        scale: number,
        ppX: number,
        ppY: number
    ) {
        const imageData = typeof this.bgImage === 'string' ? await rm.image(this.bgImage) : this.bgImage!;
        const bgImage = imageData.var;
        const bgWidth = imageData.width;
        const bgHeight = imageData.height;

        const promises = new Array<Promise<unknown>>();
        promises.push(cod.cairo('cairo_identity_matrix', cairo));
        promises.push(cod.cairo('cairo_translate', cairo, scale * ppX, scale * ppY));
        if (this.bgType === 'fill') {
            const sx = (scale * this.width) / bgWidth;
            const sy = (scale * this.height) / bgHeight;
            promises.push(cod.cairo('cairo_scale', cairo, sx, sy));
        } else if (this.bgType === 'fit') {
            const sx = this.width / bgWidth;
            const sy = this.height / bgHeight;
            const scaleRatio = scale * Math.min(sx, sy);
            promises.push(cod.cairo('cairo_scale', cairo, scaleRatio, scaleRatio));
        } else {
            promises.push(cod.cairo('cairo_scale', cairo, scale, scale));
        }

        promises.push(cod.cairo('cairo_set_source_surface', cairo, bgImage, 0, 0));
        promises.push(cod.cairo('cairo_paint', cairo));
        await Promise.all(promises);
    }
    private async drawText(cod: CamOverlayDrawingAPI, cairo: string, scale: number, ppX: number, ppY: number) {
        const promises = [
            cod.cairo('cairo_identity_matrix', cairo),
            cod.cairo('cairo_set_source_rgb', cairo, this.fontColor[0], this.fontColor[1], this.fontColor[2]),
            cod.writeText(
                cairo,
                '' + this.text,
                Math.floor(scale * ppX),
                Math.floor(scale * ppY),
                Math.floor(scale * this.width),
                Math.floor(scale * this.height),
                this.align,
                this.textType
            ),
        ];
        await Promise.all(promises);
    }
}

export { Frame };
