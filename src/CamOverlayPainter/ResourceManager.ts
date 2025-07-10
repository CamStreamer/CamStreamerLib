import { CamOverlayDrawingAPI, TUploadImageResponse, TCairoCreateResponse } from '../CamOverlayDrawingAPI';
import * as fs from 'fs/promises';

export default class ResourceManager {
    private imgFileNames: Record<string, string> = {};
    private fontFileNames: Record<string, string> = {};
    private images: Record<string, TUploadImageResponse> = {};
    private fonts: Record<string, TCairoCreateResponse> = {};

    constructor(private co: CamOverlayDrawingAPI) {}

    registerImage(moniker: string, fileName: string) {
        this.imgFileNames[moniker] = process.env.INSTALL_PATH + '/images/' + fileName;
    }

    registerFont(moniker: string, fileName: string) {
        this.fontFileNames[moniker] = process.env.INSTALL_PATH + '/fonts/' + fileName;
    }

    async image(moniker: string) {
        if (this.images[moniker] !== undefined) {
            return this.images[moniker];
        }
        if (this.imgFileNames[moniker] !== undefined) {
            const imgData = await fs.readFile(this.imgFileNames[moniker]);
            this.images[moniker] = await this.co.uploadImageData(imgData);
            return this.images[moniker];
        }

        throw new Error('Error! Unknown image requested!');
    }

    async font(moniker: string) {
        if (this.fonts[moniker] !== undefined) {
            return this.fonts[moniker];
        }
        if (this.fontFileNames[moniker] !== undefined) {
            const fontData = await fs.readFile(this.fontFileNames[moniker]);
            this.fonts[moniker] = await this.co.uploadFontData(fontData);
            return this.fonts[moniker];
        }

        throw new Error('Error! Unknown font requested!');
    }

    clear() {
        this.images = {};
        this.fonts = {};
    }
}
