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
        if (moniker in this.images) {
            return this.images[moniker];
        } else if (moniker in this.imgFileNames) {
            const imgData = await fs.readFile(this.imgFileNames[moniker]);
            this.images[moniker] = await this.co.uploadImageData(imgData);
            return this.images[moniker];
        } else {
            throw new Error('Error! Unknown image requested!');
        }
    }

    async font(moniker: string) {
        if (moniker in this.fonts) {
            return this.fonts[moniker];
        } else if (moniker in this.fontFileNames) {
            const fontData = await fs.readFile(this.fontFileNames[moniker]);
            this.fonts[moniker] = await this.co.uploadFontData(fontData);
            return this.fonts[moniker];
        } else {
            throw new Error('Error! Unknown font requested!');
        }
    }

    clear() {
        this.images = {};
        this.fonts = {};
    }
}
