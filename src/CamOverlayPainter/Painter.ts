import { CamOverlayDrawingAPI, CamOverlayDrawingOptions, TCairoCreateResponse } from '../CamOverlayDrawingAPI';
import ResourceManager from './ResourceManager';
import { Frame, TFrameOptions } from './Frame';

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

export type TPainterOptions = TFrameOptions & {
    screenWidth: number;
    screenHeight: number;
    coAlignment: string;
};

type TLayer = {
    layer: number;
    surfaceCache?: string;
    cairoCache?: string;
};

export class Painter extends Frame {
    private screenWidth: number;
    private screenHeight: number;
    private coAlignment: [number, number];

    private cod: CamOverlayDrawingAPI;
    private rm: ResourceManager;

    private refreshLayers = true;
    private layers: TLayer[] = [];

    constructor(opt: TPainterOptions, coopt: CamOverlayDrawingOptions) {
        super(opt);
        this.coAlignment = COORD[opt.coAlignment];
        this.screenWidth = opt.screenWidth;
        this.screenHeight = opt.screenHeight;

        this.cod = new CamOverlayDrawingAPI(coopt);
        this.rm = new ResourceManager(this.cod);
    }

    get camOverlayDrawingAPI() {
        return this.cod;
    }
    get resourceManager() {
        return this.rm;
    }

    connect() {
        this.cod.on('open', () => {
            this.rm.clear();
        });
        this.cod.on('error', (err) => {
            console.error('Painter:', err);
        });
        this.cod.connect();
    }

    disconnect() {
        this.cod.disconnect();
    }

    isConnected() {
        return this.cod.isConnected();
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

    setCoAlignment(coAlignment: string) {
        this.coAlignment = COORD[coAlignment];
    }

    // Overrides the Frame class
    protected layoutChanged() {
        this.refreshLayers = true;
    }

    async display(scale = 1.0) {
        if (this.enabled) {
            if (this.refreshLayers) {
                this.refreshLayers = false;
                await this.prepareLayers();
            }

            let cairo: string | undefined;
            let surface: string | undefined;
            let lastCachedLayer: TLayer | undefined;
            for (let i = 0; i < this.layers.length; i++) {
                const layer = this.layers[i];

                // Skip layer if it is already rendered
                if (
                    layer.cairoCache !== undefined &&
                    layer.surfaceCache !== undefined &&
                    surface === undefined &&
                    cairo === undefined
                ) {
                    lastCachedLayer = layer;
                    continue;
                }

                // Create layer for drawing, use cache if possible
                if (surface === undefined || cairo === undefined) {
                    [surface, cairo] = await this.prepareSurface(
                        scale,
                        lastCachedLayer?.surfaceCache,
                        lastCachedLayer?.cairoCache
                    );
                }

                await this.displayImage(this.cod, this.rm, cairo, -this.posX, -this.posY, scale, layer.layer);

                // Save layer to cache if it is not the last layer (last layer is the final image)
                if (i < this.layers.length - 1) {
                    const [surfaceToCache, cairoToCache] = await this.prepareSurface(scale, surface, cairo);
                    layer.surfaceCache = surfaceToCache;
                    layer.cairoCache = cairoToCache;
                }
            }

            if (surface !== undefined && cairo !== undefined) {
                await this.cod.showCairoImage(
                    surface,
                    this.positionConvertor(this.coAlignment[0], this.screenWidth, this.posX, scale * this.width),
                    this.positionConvertor(this.coAlignment[1], this.screenHeight, this.posY, scale * this.height)
                );
                await this.cleanupSurface(surface, cairo);
            }
        }
    }
    async hide() {
        await this.cod.removeImage();
    }

    async invalidateLayer(layer: number) {
        const layerIdx = this.layers.findIndex((l) => l.layer === layer);
        if (layerIdx === -1) {
            return;
        }

        // Invalidate all layers above the specified layer
        for (let i = layerIdx; i < this.layers.length; i++) {
            const layer = this.layers[i];
            if (layer.surfaceCache !== undefined && layer.cairoCache !== undefined) {
                await this.cleanupSurface(layer.surfaceCache, layer.cairoCache);
                layer.surfaceCache = undefined;
                layer.cairoCache = undefined;
            }
        }
    }

    private async prepareLayers() {
        // Clean up all layers
        for (const layer of this.layers) {
            if (layer.surfaceCache !== undefined && layer.cairoCache !== undefined) {
                await this.cleanupSurface(layer.surfaceCache, layer.cairoCache);
            }
        }

        // Create new layers
        const uniqueLayers = this.getLayers();
        const sortedLayers = Array.from(uniqueLayers).sort((a, b) => a - b);
        this.layers = sortedLayers.map((layer): TLayer => {
            return { layer };
        });
    }

    private async prepareSurface(scale: number, cachedSurface?: string, cachedCairo?: string) {
        const surface = (await this.cod.cairo(
            'cairo_image_surface_create',
            'CAIRO_FORMAT_ARGB32',
            Math.floor(this.width * scale),
            Math.floor(this.height * scale)
        )) as TCairoCreateResponse;
        const cairo = (await this.cod.cairo('cairo_create', surface.var)) as TCairoCreateResponse;

        if (cachedSurface !== undefined && cachedCairo !== undefined) {
            await this.cod.cairo('cairo_set_source_surface', cairo.var, cachedSurface, 0, 0);
            await this.cod.cairo('cairo_paint', cairo.var);
        }

        return [surface.var, cairo.var];
    }

    private async cleanupSurface(surface: string, cairo: string) {
        await this.cod.cairo('cairo_surface_destroy', surface);
        await this.cod.cairo('cairo_destroy', cairo);
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
}

export { Frame, TFrameOptions as FrameOptions, ResourceManager, CamOverlayDrawingOptions };
