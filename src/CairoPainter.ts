import { CamOverlayDrawingAPI, CamOverlayDrawingOptions, CairoCreateResponse } from './CamOverlayDrawingAPI';
import { ResourceManager } from './ResourceManager'
import CairoFrame from './CairoFrame';

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
    private cod: CamOverlayDrawingAPI;

    constructor(opt: Options, coopt: CamOverlayDrawingOptions, rm: ResourceManager) {
        super(opt, rm);
        this.coAlignment = COORD[opt.coAlignment];
        this.screenWidth = opt.screenWidth;
        this.screenHeight = opt.screenHeight;

        this.cod = new CamOverlayDrawingAPI(coopt);
    }

    async display(scale = 1) {
        const access = await this.begin(scale);
        this.surface = access[0];
        this.cairo = access[1];
        this.displayOwnImage(this.cod, this.cairo, 0, 0, scale);
        for (const child of this.children) {
            child.displayImage(this.cod, this.cairo, [0, 0], scale);
        }
        await this.cod.showCairoImage(
            this.surface,
            this.convertor(this.coAlignment[0], this.screenWidth, this.posX, scale * this.width),
            this.convertor(this.coAlignment[1], this.screenHeight, this.posY, scale * this.height)
        );
        await this.destroy();
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
    private async begin(scale: number) {
        const surface = (await this.cod.cairo(
            'cairo_image_surface_create',
            'CAIRO_FORMAT_ARGB32',
            Math.floor(this.width * scale),
            Math.floor(this.height * scale)
        )) as CairoCreateResponse;
        const cairo = (await this.cod.cairo('cairo_create', surface.var)) as CairoCreateResponse;

        return [surface.var, cairo.var];
    }
    private async destroy() {
        await this.cod.cairo('cairo_surface_destroy', this.surface);
        await this.cod.cairo('cairo_destroy', this.cairo);
    }
}
