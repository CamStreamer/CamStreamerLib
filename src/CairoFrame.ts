import { CamOverlayDrawingAPI, Align } from './CamOverlayDrawingAPI';
import ResourceManager from './ResourceManager';

type RGB = [number, number, number];
type RGBA = [number, number, number, number];
type Options = {
    x: number;
    y: number;
    width: number;
    height: number;
    bgImage?: string;
    text?: string;
    fontColor?: RGB;
    bgColor?: RGBA;
};
type TMF = 'TFM_OVERFLOW' | 'TFM_SCALE' | 'TFM_TRUNCATE';

export default class CairoFrame {
    protected posX: number;
    protected posY: number;
    protected width: number;
    protected height: number;

    private text: string;
    private align: Align;
    private textType: TMF;
    private fontColor: RGB;
    private fontName?: string;

    private bgColor?: RGBA;
    private bgImage?: string;
    private bgType: 'fit' | 'stretch' | 'plain';

    protected children = new Array<CairoFrame>();

    constructor(opt: Options, protected rm: ResourceManager) {
        this.posX = opt.x;
        this.posY = opt.y;
        this.width = opt.width;
        this.height = opt.height;

        this.setText(opt.text ?? '', 'A_LEFT');
        this.fontColor = opt.fontColor ?? [1.0, 1.0, 1.0];
        this.bgColor = opt.bgColor; //RGBA
        if (opt.bgImage) {
            this.setBgImage(opt.bgImage, 'plain');
        }
    }

    //  --------------------------------
    //    CairoFrame's content setting
    //  --------------------------------
    setText(text: string, align: Align, textType: TMF = 'TFM_OVERFLOW', color?: RGB): void {
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
    setBgImage(imageName: string, type: 'fit' | 'stretch' | 'plain'): void {
        this.bgImage = imageName;
        this.bgType = type;
    }
    clear(): void {
        this.text = '';
        this.align = 'A_LEFT';
        this.fontColor = [1.0, 1.0, 1.0];
        this.bgColor = undefined;
        this.bgImage = undefined;
    }
    insert(...frames: CairoFrame[]): void {
        this.children.push(...frames); // Order of insertion is order of rendering
    }

    //  ---------------------------
    //    CairoFrame displaying
    //  ---------------------------
    displayImage(cod: CamOverlayDrawingAPI, cairo: string, parentPos: [number, number], scale = 1) {
        const ppX = parentPos[0];
        const ppY = parentPos[1];

        const promises = new Array<Promise<unknown>>();
        promises.push(this.displayOwnImage(cod, cairo, this.posX + ppX, this.posY + ppY, scale));
        for (const child of this.children) {
            promises.push(child.displayImage(cod, cairo, [this.posX + ppX, this.posY + ppY], scale));
        }
        return Promise.all(promises);
    }
    protected async displayOwnImage(cod: CamOverlayDrawingAPI, cairo: string, ppX: number, ppY: number, scale: number) {
        const promises = new Array<Promise<unknown>>();
        promises.push(cod.cairo('cairo_identity_matrix', cairo));
        promises.push(cod.cairo('cairo_translate', cairo, scale * ppX, scale * ppY));
        promises.push(cod.cairo('cairo_scale', cairo, scale, scale));

        if (this.fontName) {
            const fontData = await this.rm.font(cod, this.fontName);
            promises.push(cod.cairo('cairo_set_font_face', cairo, fontData));
        } else {
            promises.push(cod.cairo('cairo_set_font_face', cairo, 'NULL'));
        }
        if (this.bgColor) {
            promises.push(this.drawFrame(cod, cairo));
        }
        if (this.bgImage) {
            promises.push(this.drawImage(cod, cairo));
        }
        if (this.text) {
            promises.push(this.drawText(cod, cairo));
        }
        return promises;
    }

    private async drawFrame(cod: CamOverlayDrawingAPI, cairo: string) {
        if (this.bgType === 'stretch') {
            const imageData = await this.rm.image(cod, this.bgImage);
            this.width = imageData.width;
            this.height = imageData.height;
        }

        const promises = new Array<Promise<unknown>>();
        promises.push(
            cod.cairo(
                'cairo_set_source_rgba',
                cairo,
                this.bgColor[0],
                this.bgColor[1],
                this.bgColor[2],
                this.bgColor[3]
            )
        );
        promises.push(cod.cairo('cairo_rectangle', cairo, 0, 0, this.width, this.height));
        promises.push(cod.cairo('cairo_fill', cairo));
        promises.push(cod.cairo('cairo_stroke', cairo));
    }
    private async drawImage(cod: CamOverlayDrawingAPI, cairo: string) {
        const imageData = await this.rm.image(cod, this.bgImage);
        const bgImage = imageData.var;
        const bgWidth = imageData.width;
        const bgHeight = imageData.height;

        const promises = new Array<Promise<unknown>>();
        if (this.bgType === 'fit' && bgWidth !== undefined && bgHeight !== undefined) {
            const sx = this.width / bgWidth;
            const sy = this.height / bgHeight;
            promises.push(cod.cairo('cairo_scale', cairo, sx, sy));
        }

        promises.push(cod.cairo('cairo_set_source_surface', cairo, bgImage, 0, 0));
        promises.push(cod.cairo('cairo_paint', cairo));
        return Promise.all(promises);
    }
    private drawText(cod: CamOverlayDrawingAPI, cairo: string) {
        const promises = new Array<Promise<unknown>>();
        promises.push(
            cod.cairo('cairo_set_source_rgb', cairo, this.fontColor[0], this.fontColor[1], this.fontColor[2])
        );
        promises.push(
            cod.writeText(
                cairo,
                '' + this.text,
                0,
                0,
                Math.floor(this.width),
                Math.floor(this.height),
                this.align,
                this.textType
            )
        );
        return Promise.all(promises);
    }
}
