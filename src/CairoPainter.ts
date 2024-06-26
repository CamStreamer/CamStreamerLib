import { CamOverlayDrawingAPI, CairoCreateResponse } from 'camstreamerlib/CamOverlayDrawingAPI';

import CairoFrame from './cairoFrame';

const COORD: Record<string, [number, number]> = {
    top_left: [-1, -1],
    center_left: [-1, 0],
    bottom_left: [-1, 1],
    top_center: [0, -1],
    center: [0, 0],
    bottom_center: [0, 1],
    top_right: [1, -1],
    center_right: [1, 0],
    bottom_right: [1, 1],
};

type Options = {
    x: number;
    y: number;
    width: number;
    height: number;
    screenWidth: number;
    screenHeight: number;
    coAlignment: string;
};

export default class CairoPainter extends CairoFrame {
    private screenWidth: number;
    private screenHeight: number;
    private coAlignment: [number, number];
    private surface?: string;
    private cairo?: string;

    constructor(opt: Options) {
        super(opt);
        this.coAlignment = COORD[opt.coAlignment];
        this.screenWidth = opt.screenWidth;
        this.screenHeight = opt.screenHeight;
    }

    async generate(cod: CamOverlayDrawingAPI, scale = 1) {
        const access = await this.begin(cod, scale);
        this.surface = access[0];
        this.cairo = access[1];
        this.generateOwnImage(cod, this.cairo, 0, 0, scale);
        for (const child of this.children) {
            child.generateImage(cod, this.cairo, [0, 0], scale);
        }
        await cod.showCairoImage(
            this.surface,
            this.convertor(this.coAlignment[0], this.screenWidth, this.posX, scale * this.width),
            this.convertor(this.coAlignment[1], this.screenHeight, this.posY, scale * this.height)
        );
        await this.destroy(cod);
    }
    private convertor(alignment: number, screenSize: number, position: number, graphicsSize: number): number {
        switch (alignment) {
            case -1:
                return alignment + (2.0 * position) / screenSize;
            case 0:
                return alignment - (2.0 * (position + graphicsSize / 2)) / screenSize;
            case 1:
                return alignment - (2.0 * (position + graphicsSize)) / screenSize;
            default:
                throw new Error('Invalid graphics alignment.');
        }
    }
    private async begin(cod: CamOverlayDrawingAPI, scale: number) {
        const surface = (await cod.cairo(
            'cairo_image_surface_create',
            'CAIRO_FORMAT_ARGB32',
            Math.floor(this.width * scale),
            Math.floor(this.height * scale)
        )) as CairoCreateResponse;
        const cairo = (await cod.cairo('cairo_create', surface.var)) as CairoCreateResponse;

        return [surface.var, cairo.var];
    }
    private async destroy(cod: CamOverlayDrawingAPI) {
        await cod.cairo('cairo_surface_destroy', this.surface);
        await cod.cairo('cairo_destroy', this.cairo);
    }
}
