import { responseStringify } from './internal/common';

const ACTION = 'AddCameraBookmark';
const GET_CAMERAS_URL = 'report/EntityConfiguration?q=EntityTypes@Camera';
const GET_CAMERAS_DETAILS_URL = '/entity?q=';

function pad(num: number, size: number) {
    const sign = Math.sign(num) === -1 ? '-' : '';
    return (
        sign +
        new Array(size)
            .concat([Math.abs(num)])
            .join('0')
            .slice(-size)
    );
}

function getTimeStamp() {
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

type TCameraGuidsResponse = {
    Rsp: {
        Status: string;
        Result: { Guid: string }[];
    };
};

type TCameraDetailsResponse<T extends string> = {
    Rsp: {
        Status: string;
        Result: Array<Record<T, string>>;
    };
};

type TConnectionResponse = {
    Rsp: {
        Status: string;
    };
};

export type GenetecAgentOptions = {
    protocol?: 'http' | 'https' | 'https_insecure';
    ip?: string;
    port?: number;
    base_uri?: string;
    user?: string;
    pass?: string;
    app_id?: string;
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
            base_uri: options.base_uri ?? 'WebSdk',
            user: options.user ?? 'root',
            pass: options.pass ?? '',
            app_id: options.app_id ?? '',
        };

        this.baseUrl = `${this.settings.protocol}://${this.settings.ip}:${this.settings.port}/${this.settings.base_uri}`;
        this.credentials = btoa(`${this.settings.user};${this.settings.app_id}:${this.settings.pass}`);
    }

    set setGenetecSettings(newSettings: { baseUri: string; credentials: string }) {
        this.settings.base_uri = newSettings.baseUri;
        this.credentials = newSettings.credentials;
    }

    async checkConnection(): Promise<TConnectionResponse> {
        const requestOptions = this.getRequestOptions('GET');
        const res = await fetch(`${this.baseUrl}/`, requestOptions);

        if (!res.ok) {
            throw new Error(await responseStringify(res));
        }
        return (await res.json()) as TConnectionResponse;
    }

    async getAllCameraGuids(): Promise<TCameraGuidsResponse> {
        const requestOptions = this.getRequestOptions('GET');
        const res = await fetch(`${this.baseUrl}/${GET_CAMERAS_URL}`, requestOptions);

        if (!res.ok) {
            throw new Error(await responseStringify(res));
        }
        return (await res.json()) as TCameraGuidsResponse;
    }

    async getCameraDetails<T extends string>(guids: { Guid: string }[], parameters: T[]) {
        const params = parameters.join(',');
        const camerasGuids = guids.map((item) => item.Guid);
        const camerasDetailsUrl = [];
        const requestOptions = this.getRequestOptions('GET');

        for (const guid of camerasGuids) {
            camerasDetailsUrl.push(`entity=${guid},${params}`);
        }

        const res = await fetch(
            `${this.baseUrl}/${GET_CAMERAS_DETAILS_URL}${camerasDetailsUrl.join(',')}`,
            requestOptions
        );

        if (!res.ok) {
            throw new Error(await responseStringify(res));
        }
        return (await res.json()) as TCameraDetailsResponse<T>;
    }

    async sendBookmark(guids: string[], bookmarkText: string): Promise<Response> {
        const cameraEntitiesUrl: string[] = [];
        const timeStamp = getTimeStamp();
        const requestOptions = this.getRequestOptions('POST');

        for (const guid of guids) {
            cameraEntitiesUrl.push(`${ACTION}(${guid},${timeStamp},${bookmarkText})`);
        }

        const res = await fetch(`${this.baseUrl}/action?q=${cameraEntitiesUrl.join(',')}`, requestOptions);

        if (!res.ok) {
            throw new Error(await responseStringify(res));
        }
        return res;
    }

    private getRequestOptions(method: string): RequestInit {
        return {
            method: method,
            headers: new Headers({
                Authorization: `Basic ${this.credentials}`,
                Accept: 'text/json',
            }),
            redirect: 'follow',
        };
    }
}
