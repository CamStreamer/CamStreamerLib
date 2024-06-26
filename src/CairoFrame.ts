import { CamOverlayDrawingAPI, UploadImageResponse, Align } from './CamOverlayDrawingAPI';
import { ResourceManager } from './ResourceManager';

type RGB = [number, number, number];
type RGBA = [number, number, number, number];
type Options = {
    x: number;
    y: number;
    width: number;
    height: number;
    bg?: string;
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

    private bgImage?: string;
    private text: string;
    private fontColor: RGB;
    private bgColor?: RGBA;

    private fontName?: string;
    private bgType: 'fit' | 'stretch' | 'plain';
    private textType: TMF;
    private align: Align;

    private bgWidth?: number;
    private bgHeight?: number;
    protected children = new Array<CairoFrame>();

    constructor(opt: Options, private cod: CamOverlayDrawingAPI, private rm: ResourceManager) {
        this.posX = opt.x;
        this.posY = opt.y;
        this.width = opt.width;
        this.height = opt.height;

        this.bgImage = opt.bg;
        this.text = opt.text ?? '';
        this.fontColor = opt.fontColor ?? [1.0, 1.0, 1.0];
        this.bgColor = opt.bgColor; //RGBA

        this.bgType = 'plain';
        this.textType = 'TFM_OVERFLOW';
        this.align = 'A_LEFT';
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
    setBgImage(imageData: UploadImageResponse, type: 'fit' | 'stretch' | 'plain'): void {
        this.bgImage = imageData.var;
        this.bgWidth = imageData.width;
        this.bgHeight = imageData.height;
        if (type === 'stretch') {
            this.width = this.bgWidth;
            this.height = this.bgHeight;
        }
        this.bgType = type;
    }
    clear(): void {
        this.bgImage = undefined;
        this.bgWidth = 0;
        this.bgHeight = 0;
        this.text = '';
        this.fontColor = [1.0, 1.0, 1.0];
        this.align = 'A_LEFT';
    }
    insert(...frames: CairoFrame[]): void {
        this.children.push(...frames); // Order of insertion is order of rendering
    }

    //  ---------------------------
    //    CairoFrame displaying
    //  ---------------------------
    displayImage(cairo: string, parentPos: [number, number], scale = 1): void {
        const ppX = parentPos[0];
        const ppY = parentPos[1];

        this.displayOwnImage(cairo, this.posX + ppX, this.posY + ppY, scale);
        for (const child of this.children) {
            child.displayImage(cairo, [this.posX + ppX, this.posY + ppY], scale);
        }
    }
    protected displayOwnImage(cairo: string, ppX: number, ppY: number, scale: number): void {
        void this.cod.cairo('cairo_identity_matrix', cairo);
        void this.cod.cairo('cairo_translate', cairo, scale * ppX, scale * ppY);
        void this.cod.cairo('cairo_scale', cairo, scale, scale);

        if (this.fontName) {
            this.rm.font(this.fontName).then((fontData) => {
                void this.cod.cairo('cairo_set_font_face', cairo, fontData);
            });
        } else {
            void this.cod.cairo('cairo_set_font_face', cairo, 'NULL');
        }
        if (this.bgColor) {
            this.drawFrame(cairo);
        }
        if (this.bgImage) {
            this.drawImage(cairo);
        }
        if (this.text) {
            this.drawText(cairo);
        }
    }

    private drawFrame(cairo: string): void {
        void this.cod.cairo(
            'cairo_set_source_rgba',
            cairo,
            this.bgColor[0],
            this.bgColor[1],
            this.bgColor[2],
            this.bgColor[3]
        );
        this.cod.cairo('cairo_rectangle', cairo, 0, 0, this.width, this.height);
        this.cod.cairo('cairo_fill', cairo);
        this.cod.cairo('cairo_stroke', cairo);
    }
    private drawImage(cairo: string): void {
        if (this.bgType === 'fit' && this.bgWidth !== undefined && this.bgHeight !== undefined) {
            const sx = this.width / this.bgWidth;
            const sy = this.height / this.bgHeight;
            void this.cod.cairo('cairo_scale', cairo, sx, sy);
        }
        this.rm.image(this.bgImage).then((imageData) => {
            void this.cod.cairo('cairo_set_source_surface', cairo, imageData, 0, 0);
            void this.cod.cairo('cairo_paint', cairo);
        });
    }
    private drawText(cairo: string): void {
        void this.cod.cairo('cairo_set_source_rgb', cairo, this.fontColor[0], this.fontColor[1], this.fontColor[2]);
        void this.cod.writeText(
            cairo,
            '' + this.text,
            0,
            0,
            Math.floor(this.width),
            Math.floor(this.height),
            this.align,
            this.textType
        );
    }
}
