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

export class Genetec {
    private protocol: 'http' | 'https' | 'https_insecure';
    private ip: string;
    private port: number;
    private user: string;
    private pass: string;
    private appId: string;
    private baseUri: string;
    private baseUrl: string;
    private credentials: string;

    constructor(options: GenetecAgentOptions = {}) {
        this.protocol = options.protocol ?? 'http';
        this.ip = options.ip ?? '127.0.0.1';
        this.port = options.port ?? 80;
        this.user = options.user ?? 'root';
        this.pass = options.pass ?? '';
        this.appId = options.app_id ?? '';
        this.baseUri = options.base_uri ?? 'WebSdk';

        this.baseUrl = `${this.protocol}://${this.ip}:${this.port}/${this.baseUri}`;
        this.credentials = btoa(`${this.user};${this.appId}:${this.pass}`);
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

    async sendBookmark(guids: { Guid: string }[], bookmarkText: string): Promise<Response> {
        const camerasGuids = guids.map((item) => item.Guid);
        const cameraEntitiesUrl: string[] = [];
        const timeStamp = getTimeStamp();
        const requestOptions = this.getRequestOptions('POST');

        for (const guid of camerasGuids) {
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
