import { CamOverlayDrawingAPI, UploadImageResponse, Align } from './CamOverlayDrawingAPI';

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

    private font?: string;
    private bgType: 'fit' | 'stretch' | 'plain';
    private textType: TMF;
    private align: Align;

    private bgWidth?: number;
    private bgHeight?: number;
    protected children = new Array<CairoFrame>();

    constructor(opt: Options) {
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

    setText(text: string, align: Align, textType: TMF = 'TFM_OVERFLOW', color?: RGB): void {
        this.text = text;
        this.align = align;
        this.textType = textType;
        if (color) {
            this.fontColor = color;
        }
    }

    setFont(fontdata: string): void {
        this.font = fontdata;
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

    generateImage(cod: CamOverlayDrawingAPI, cairo: string, parentPos: [number, number], scale = 1): void {
        const ppX = parentPos[0];
        const ppY = parentPos[1];

        this.generateOwnImage(cod, cairo, this.posX + ppX, this.posY + ppY, scale);
        for (const child of this.children) {
            child.generateImage(cod, cairo, [this.posX + ppX, this.posY + ppY], scale);
        }
    }

    protected generateOwnImage(
        cod: CamOverlayDrawingAPI,
        cairo: string,
        ppX: number,
        ppY: number,
        scale: number
    ): void {
        void cod.cairo('cairo_identity_matrix', cairo);
        void cod.cairo('cairo_translate', cairo, scale * ppX, scale * ppY);
        void cod.cairo('cairo_scale', cairo, scale, scale);

        if (this.font !== undefined) {
            void cod.cairo('cairo_set_font_face', cairo, this.font);
        } else {
            void cod.cairo('cairo_set_font_face', cairo, 'NULL');
        }
        if (this.bgColor) {
            void cod.cairo(
                'cairo_set_source_rgba',
                cairo,
                this.bgColor[0],
                this.bgColor[1],
                this.bgColor[2],
                this.bgColor[3]
            );
            this.drawFrame(cod, cairo);
        }
        if (this.bgImage !== undefined) {
            if (this.bgType === 'fit' && this.bgWidth !== undefined && this.bgHeight !== undefined) {
                const sx = this.width / this.bgWidth;
                const sy = this.height / this.bgHeight;
                void cod.cairo('cairo_scale', cairo, sx, sy);
            }
            void cod.cairo('cairo_set_source_surface', cairo, this.bgImage, 0, 0);
            void cod.cairo('cairo_paint', cairo);
        }
        if (this.text) {
            void cod.cairo('cairo_set_source_rgb', cairo, this.fontColor[0], this.fontColor[1], this.fontColor[2]);
            void cod.writeText(
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

    private drawFrame(cod: CamOverlayDrawingAPI, cairo: string): void {
        cod.cairo('cairo_rectangle', cairo, 0, 0, this.width, this.height);
        cod.cairo('cairo_fill', cairo);
        cod.cairo('cairo_stroke', cairo);
    }
}
