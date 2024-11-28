import { EventEmitter } from 'events';
import { CamOverlayDrawingAPI, TAlign, TCairoCreateResponse, TUploadImageResponse } from '../CamOverlayDrawingAPI';
import ResourceManager from './ResourceManager';

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

export interface Frame {
    on(event: 'layoutChanged', listener: () => void): this;
    emit(event: 'layoutChanged'): boolean;
}

export class Frame extends EventEmitter {
    protected enabled: boolean;

    protected posX: number;
    protected posY: number;
    protected width: number;
    protected height: number;

    private text = '';
    private fontColor: TRgb;
    private font?: string | TCairoCreateResponse;
    private align: TAlign = 'A_LEFT';
    private textType: TTmf = 'TFM_OVERFLOW';

    private bgColor?: TRgba;
    private bgImage?: string | TUploadImageResponse;
    private bgType?: TObjectFitType;

    private borderRadius: number;
    private borderWidth: number;
    private borderColor: TRgba;

    private customDraw?: TDrawingCallback;
    private layer: number;

    protected children = new Array<Frame>();

    constructor(opt: TFrameOptions) {
        super();

        this.enabled = opt.enabled ?? true;
        this.posX = opt.x;
        this.posY = opt.y;
        this.width = opt.width;
        this.height = opt.height;

        this.setText(opt.text ?? '', 'A_LEFT');
        this.fontColor = opt.fontColor ?? [1.0, 1.0, 1.0];
        this.font = opt.font;

        this.bgColor = opt.bgColor; // RGBA
        this.bgImage = opt.bgImage;
        this.bgType = opt.bgType;

        this.borderRadius = opt.borderRadius ?? 0;
        this.borderWidth = opt.borderWidth ?? 0;
        this.borderColor = opt.borderColor ?? [1, 1, 1, 1];

        this.customDraw = opt.customDraw;
        this.layer = opt.layer ?? 0;
    }

    //  -------------------------------
    //      Frame's content setting
    //  -------------------------------

    enable() {
        this.enabled = true;
    }
    disable() {
        this.enabled = false;
    }

    setFramePosition(x: number, y: number) {
        this.posX = x;
        this.posY = y;
    }
    setFrameSize(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    setText(text: string, align: TAlign, textType: TTmf = 'TFM_OVERFLOW', fontColor?: TRgb): void {
        this.text = text;
        this.align = align;
        this.textType = textType;
        if (fontColor) {
            this.fontColor = fontColor;
        }
    }
    setFontColor(fontColor: TRgb): void {
        this.fontColor = fontColor;
    }
    setFont(fontName: string): void {
        this.font = fontName;
    }
    setFontData(fontData: TCairoCreateResponse): void {
        this.font = fontData;
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
    setBgType(type: TObjectFitType): void {
        this.bgType = type;
    }

    setBorderRadius(radius: number): void {
        this.borderRadius = radius;
    }

    setBorderWidth(width: number): void {
        this.borderWidth = width;
    }

    setBorderColor(color: TRgba): void {
        this.borderColor = color;
    }

    setCustomDraw(customDraw: TDrawingCallback) {
        this.customDraw = customDraw;
    }

    resetFont(): void {
        this.font = undefined;
    }
    resetBgColor(): void {
        this.bgColor = undefined;
    }
    resetBgImage(): void {
        this.bgImage = undefined;
        this.bgType = undefined;
    }
    resetCustomDraw(): void {
        this.customDraw = undefined;
    }

    clear(): void {
        this.text = '';
        this.align = 'A_LEFT';
        this.textType = 'TFM_OVERFLOW';
        this.fontColor = [1.0, 1.0, 1.0];
        this.font = undefined;

        this.bgColor = undefined;
        this.bgImage = undefined;
        this.bgType = undefined;
        this.customDraw = undefined;
    }

    insert(...frames: Frame[]): void {
        // Order of insertion is order of rendering
        this.children.push(...frames);

        // Add listeners for layout changes
        for (const frame of frames) {
            frame.on('layoutChanged', () => this.layoutChanged());
        }
        this.layoutChanged();
    }

    getLayers() {
        const uniqueLayers = new Set<number>();
        uniqueLayers.add(this.layer);

        for (const child of this.children) {
            for (const layer of child.getLayers()) {
                uniqueLayers.add(layer);
            }
        }
        return uniqueLayers;
    }

    protected layoutChanged() {
        this.emit('layoutChanged');
    }

    //  ------------------------
    //      Frame displaying
    //  ------------------------

    async displayImage(
        cod: CamOverlayDrawingAPI,
        resourceManager: ResourceManager,
        cairo: string,
        ppX: number,
        ppY: number,
        scale: number,
        layer: number
    ) {
        if (this.enabled) {
            ppX += this.posX;
            ppY += this.posY;

            // Resources have to be prepared before drawing to avoid async problems
            await this.prepareResources(resourceManager);

            await cod.cairo('cairo_save', cairo);
            await this.clipDrawing(cod, cairo, scale, ppX, ppY);

            if (this.layer === layer) {
                await this.displayOwnImage(cod, cairo, ppX, ppY, scale);
            }
            for (const child of this.children) {
                await child.displayImage(cod, resourceManager, cairo, ppX, ppY, scale, layer);
            }

            await cod.cairo('cairo_restore', cairo);
        }
    }

    private async prepareResources(resourceManager: ResourceManager) {
        if (typeof this.bgImage === 'string') {
            this.bgImage = await resourceManager.image(this.bgImage);
        }
        if (typeof this.font === 'string') {
            this.font = await resourceManager.font(this.font);
        }
    }

    protected async displayOwnImage(cod: CamOverlayDrawingAPI, cairo: string, ppX: number, ppY: number, scale: number) {
        if (!this.enabled) {
            return;
        }

        const promises = new Array<Promise<unknown>>();
        if (this.font !== undefined && typeof this.font !== 'string') {
            promises.push(cod.cairo('cairo_set_font_face', cairo, this.font.var));
        } else {
            promises.push(cod.cairo('cairo_set_font_face', cairo, 'NULL'));
        }

        if (this.bgColor !== undefined) {
            promises.push(this.drawFrame(cod, cairo, scale, ppX, ppY));
        }
        if (this.bgImage !== undefined) {
            promises.push(this.drawImage(cod, cairo, scale, ppX, ppY));
        }
        if (this.borderWidth > 0) {
            promises.push(this.drawBorder(cod, cairo, scale, ppX, ppY));
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

    private async clipDrawing(cod: CamOverlayDrawingAPI, cairo: string, scale: number, ppX: number, ppY: number) {
        if (this.borderRadius === 0) {
            return;
        }

        await Promise.all([
            this.drawRectPath(cod, cairo, scale, ppX, ppY, this.borderRadius),
            cod.cairo('cairo_clip', cairo),
        ]);
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
            throw new Error('Color of the frame is undefined.');
        }
    }

    private async drawImage(cod: CamOverlayDrawingAPI, cairo: string, scale: number, ppX: number, ppY: number) {
        if (this.bgImage === undefined || typeof this.bgImage === 'string') {
            return;
        }

        const bgImage = this.bgImage.var;
        const bgWidth = this.bgImage.width;
        const bgHeight = this.bgImage.height;

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

    private async drawBorder(cod: CamOverlayDrawingAPI, cairo: string, scale: number, ppX: number, ppY: number) {
        await Promise.all([
            this.drawRectPath(cod, cairo, scale, ppX, ppY, this.borderRadius),
            cod.cairo(
                'cairo_set_source_rgba',
                cairo,
                this.borderColor[0],
                this.borderColor[1],
                this.borderColor[2],
                this.borderColor[3]
            ),
            cod.cairo('cairo_set_line_width', cairo, this.borderWidth),
            cod.cairo('cairo_stroke', cairo),
        ]);
    }

    private async drawRectPath(
        cod: CamOverlayDrawingAPI,
        cairo: string,
        scale: number,
        ppX: number,
        ppY: number,
        radius: number
    ) {
        if (radius === 0) {
            return await Promise.all([
                cod.cairo('cairo_identity_matrix', cairo),
                cod.cairo('cairo_translate', cairo, scale * ppX, scale * ppY),
                cod.cairo('cairo_scale', cairo, scale, scale),
                cod.cairo('cairo_rectangle', cairo, 0, 0, this.width, this.height),
            ]);
        } else {
            const degrees = Math.PI / 180;
            return await Promise.all([
                cod.cairo('cairo_identity_matrix', cairo),
                cod.cairo('cairo_translate', cairo, scale * ppX, scale * ppY),
                cod.cairo('cairo_scale', cairo, scale, scale),
                cod.cairo('cairo_new_sub_path', cairo),
                cod.cairo('cairo_arc', cairo, this.width - radius, radius, radius, -90 * degrees, 0 * degrees),
                cod.cairo(
                    'cairo_arc',
                    cairo,
                    this.width - radius,
                    this.height - radius,
                    radius,
                    0 * degrees,
                    90 * degrees
                ),
                cod.cairo('cairo_arc', cairo, radius, this.height - radius, radius, 90 * degrees, 180 * degrees),
                cod.cairo('cairo_arc', cairo, radius, radius, radius, 180 * degrees, 270 * degrees),
                cod.cairo('cairo_close_path', cairo),
            ]);
        }
    }
}
