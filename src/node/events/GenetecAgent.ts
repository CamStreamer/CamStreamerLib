import { z } from 'zod';
import { responseStringify, pad } from '../../internal/utils';

const successResponseSchema = z.object({
    Rsp: z.object({
        Status: z.literal('Ok'),
    }),
});

const cameraGuidsResponseSchema = z.object({
    Rsp: z.object({
        Status: z.literal('Ok'),
        Result: z.array(z.object({ Guid: z.string() })),
    }),
});
export type TCameraGuidsResponse = z.infer<typeof cameraGuidsResponseSchema>;

const cameraDetailSchema = z.object({
    Guid: z.string().optional(),
    Name: z.string().optional(),
    EntityType: z.string().optional(),
});
const cameraDetailsResponseSchema = z.object({
    Rsp: z.object({
        Status: z.literal('Ok'),
        Result: z.union([z.array(cameraDetailSchema), cameraDetailSchema]),
    }),
});
export type TCameraDetailsResponse = z.infer<typeof cameraDetailsResponseSchema>;
export type TCameraDetail = z.infer<typeof cameraDetailSchema>;

export const cameraListSchema = z.array(
    z.object({
        index: z.number(),
        value: z.string(),
        label: z.string(),
    })
);
export type TCameraList = z.infer<typeof cameraListSchema>;

export type TParams = Array<'Guid' | 'Name' | 'EntityType'>;
export type TProtocol = 'http' | 'https' | 'https_insecure';

export type GenetecAgentOptions = {
    protocol?: TProtocol;
    ip?: string;
    port?: number;
    baseUri?: string;
    user?: string;
    pass?: string;
    appId?: string;
    timeout?: number;
};

export class GenetecAgent {
    private settings: GenetecAgentOptions;
    private baseUrl: string;
    private credentials: string;

    constructor(options: GenetecAgentOptions = {}) {
        this.settings = {
            protocol: options.protocol ?? 'http',
            ip: options.ip ?? '127.0.0.1',
            port: options.port ?? 80,
            baseUri: options.baseUri ?? 'WebSdk',
            user: options.user ?? 'root',
            pass: options.pass ?? '',
            appId: options.appId ?? '',
            timeout: options.timeout ?? 10000,
        };

        this.baseUrl = `${this.settings.protocol}://${this.settings.ip}:${this.settings.port}/${this.settings.baseUri}`;
        this.credentials = btoa(`${this.settings.user};${this.settings.appId}:${this.settings.pass}`);
    }

    async checkConnection() {
        const requestOptions = this.getRequestOptions('GET');

        const res = await this.fetchWithTimeout(new URL(this.baseUrl), requestOptions);

        if (!res.ok) {
            throw new Error(await responseStringify(res));
        }
        const responseBody = await res.text();
        const result = await successResponseSchema.safeParseAsync(JSON.parse(responseBody));
        if (!result.success) {
            throw new Error(
                'Genetec connection test failed: ' + JSON.stringify(result.error.issues) + '\n' + responseBody
            );
        }
    }

    async getAllCameraGuids(): Promise<TCameraGuidsResponse> {
        const requestOptions = this.getRequestOptions('GET');
        const url = new URL(`${this.baseUrl}/report/EntityConfiguration`);
        url.searchParams.set('q', 'EntityTypes@Camera');
        const res = await this.fetchWithTimeout(url, requestOptions);

        if (!res.ok) {
            throw new Error(await responseStringify(res));
        }

        const responseBody = await res.text();
        const result = await cameraGuidsResponseSchema.safeParseAsync(JSON.parse(responseBody));
        if (!result.success) {
            throw new Error(
                'Genetec get camera guids failed: ' + JSON.stringify(result.error.issues) + '\n' + responseBody
            );
        }
        return result.data;
    }

    async getCameraDetails(guids: { Guid: string }[], parameters: TParams): Promise<TCameraDetail[]> {
        const params = parameters.join(',');
        const requestOptions = this.getRequestOptions('GET');
        const allCameras = [] as TCameraDetail[];

        const chunkSize = 10;
        while (guids.length > 0) {
            const chunk = guids.slice(0, chunkSize);
            guids.splice(0, chunkSize);

            const url = new URL(`${this.baseUrl}/entity`);
            url.searchParams.set('q', chunk.map((item) => `entity=${item.Guid},${params}`).join(','));
            const res = await this.fetchWithTimeout(url, requestOptions);

            if (!res.ok) {
                throw new Error(await responseStringify(res));
            }

            const responseBody = await res.text();
            const result = await cameraDetailsResponseSchema.safeParseAsync(JSON.parse(responseBody));
            if (!result.success) {
                throw new Error(
                    'Genetec get camera details failed: ' + JSON.stringify(result.error.issues) + '\n' + responseBody
                );
            }

            const data = result.data;
            const resultArray = Array.isArray(data.Rsp.Result) ? data.Rsp.Result : [data.Rsp.Result];
            allCameras.push(...resultArray);
        }

        return allCameras;
    }

    async sendBookmark(guids: string[], bookmarkText: string) {
        const timeStamp = this.getTimeStamp();
        const requestOptions = this.getRequestOptions('POST');

        const url = new URL(`${this.baseUrl}/action`);
        url.searchParams.set(
            'q',
            guids.map((guid) => `AddCameraBookmark(${guid},${timeStamp},${bookmarkText})`).join(',')
        );

        const res = await this.fetchWithTimeout(url, requestOptions);

        if (!res.ok) {
            throw new Error(await responseStringify(res));
        }

        const responseBody = await res.text();
        const result = await successResponseSchema.safeParseAsync(JSON.parse(responseBody));
        if (!result.success) {
            throw new Error(
                'Genetec send bookmark failed: ' + JSON.stringify(result.error.issues) + '\n' + responseBody
            );
        }
    }

    private getRequestOptions(method: string): RequestInit {
        return {
            method,
            headers: new Headers({
                Authorization: `Basic ${this.credentials}`,
                Accept: 'text/json',
            }),
            redirect: 'follow',
        };
    }

    private getTimeStamp() {
        const date = new Date();
        const year = date.getUTCFullYear();
        const month = pad(date.getUTCMonth() + 1, 2);
        const day = pad(date.getUTCDate(), 2);
        const hours = pad(date.getUTCHours(), 2);
        const minutes = pad(date.getUTCMinutes(), 2);
        const seconds = pad(date.getUTCSeconds(), 2);
        const miliSeconds = pad(date.getUTCMilliseconds(), 2);

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${miliSeconds}Z`;
    }

    private async fetchWithTimeout(url: URL, options: RequestInit): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.settings.timeout);
        try {
            return await fetch(url, { ...options, signal: controller.signal });
        } finally {
            clearTimeout(timeoutId);
        }
    }
}
