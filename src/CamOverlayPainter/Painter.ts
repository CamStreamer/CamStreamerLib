import { CamOverlayDrawingAPI, CamOverlayDrawingOptions, TCairoCreateResponse } from '../CamOverlayDrawingAPI';
import ResourceManager from './ResourceManager';
import { Frame, FrameOptions } from './Frame';

export const COORD: Record<string, [number, number]> = {
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

export type PainterOptions = FrameOptions & {
    screenWidth: number;
    screenHeight: number;
    coAlignment: string;
};

export default class Painter extends Frame {
    private screenWidth: number;
    private screenHeight: number;
    private coAlignment: [number, number];

    private surface?: string;
    private cairo?: string;
    private cod: CamOverlayDrawingAPI;
    private rm: ResourceManager;

    get camOverlayDrawingAPI() {
        return this.cod;
    }
    get resourceManager() {
        return this.rm;
    }

    constructor(opt: PainterOptions, coopt: CamOverlayDrawingOptions) {
        super(opt);
        this.coAlignment = COORD[opt.coAlignment];
        this.screenWidth = opt.screenWidth;
        this.screenHeight = opt.screenHeight;

        this.cod = new CamOverlayDrawingAPI(coopt);
        this.rm = new ResourceManager(this.cod);
    }

    async connect() {
        this.cod.on('open', () => {
            this.rm.clear();
        });
        return this.cod.connect();
    }
    disconnect() {
        this.cod.disconnect();
    }

    registerImage(moniker: string, fileName: string) {
        this.rm.registerImage(moniker, fileName);
    }
    registerFont(moniker: string, fileName: string) {
        this.rm.registerFont(moniker, fileName);
    }

    setScreenSize(sw: number, sh: number) {
        this.screenWidth = sw;
        this.screenHeight = sh;
    }
    setCoAlignment(coa: string) {
        this.coAlignment = COORD[coa];
    }

    async display(scale = 1) {
        if (this.enabled) {
            [this.surface, this.cairo] = await this.prepareDrawing(scale);

            await this.displayOwnImage(this.cod, this.rm, this.cairo, 0, 0, scale);
            for (const child of this.children) {
                await child.displayImage(this.cod, this.rm, this.cairo, 0, 0, scale);
            }

            await this.cod.showCairoImage(
                this.surface,
                this.positionConvertor(this.coAlignment[0], this.screenWidth, this.posX, scale * this.width),
                this.positionConvertor(this.coAlignment[1], this.screenHeight, this.posY, scale * this.height)
            );
            await this.destroy();
        }
    }
    async hide() {
        await this.cod.removeImage();
    }

    private positionConvertor(alignment: number, screenSize: number, position: number, graphicsSize: number): number {
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
    private async prepareDrawing(scale: number) {
        const surface = (await this.cod.cairo(
            'cairo_image_surface_create',
            'CAIRO_FORMAT_ARGB32',
            Math.floor(this.width * scale),
            Math.floor(this.height * scale)
        )) as TCairoCreateResponse;
        const cairo = (await this.cod.cairo('cairo_create', surface.var)) as TCairoCreateResponse;

        return [surface.var, cairo.var];
    }
    private async destroy() {
        await this.cod.cairo('cairo_surface_destroy', this.surface);
        await this.cod.cairo('cairo_destroy', this.cairo);
    }
}

export { Painter, Frame, FrameOptions, ResourceManager, CamOverlayDrawingOptions };
