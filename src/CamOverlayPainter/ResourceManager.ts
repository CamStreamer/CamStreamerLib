import { CamOverlayDrawingAPI, TUploadImageResponse, TCairoCreateResponse } from '../CamOverlayDrawingAPI';
import * as fs from 'fs/promises';

export default class ResourceManager {
    private imgFiles: Record<string, string> = {};
    private fontFiles: Record<string, string> = {};
    private images: Record<string, TUploadImageResponse> = {};
    private fonts: Record<string, TCairoCreateResponse> = {};

    constructor() {}

    async image(co: CamOverlayDrawingAPI, moniker: string) {
        if (moniker in this.images) {
            return this.images[moniker];
        } else if (moniker in this.imgFiles) {
            const imgData = await fs.readFile(this.imgFiles[moniker]);
            this.images[moniker] = await co.uploadImageData(imgData);
            return this.images[moniker];
        } else {
            throw new Error('Error! Unknown image requested!');
        }
    }

    async font(co: CamOverlayDrawingAPI, moniker: string) {
        if (moniker in this.fonts) {
            return this.fonts[moniker];
        } else if (moniker in this.fontFiles) {
            const fontData = await fs.readFile(this.fontFiles[moniker]);
            this.fonts[moniker] = await co.uploadFontData(fontData);
            return this.fonts[moniker];
        } else {
            throw new Error('Error! Unknown font requested!');
        }
    }

    registerImage(moniker: string, fileName: string) {
        this.imgFiles[moniker] = process.env.INSTALL_PATH + '/images/' + fileName;
    }

    registerFont(moniker: string, fileName: string) {
        this.fontFiles[moniker] = process.env.INSTALL_PATH + '/fonts/' + fileName;
    }

    clear() {
        this.images = {};
        this.fonts = {};
    }
}
