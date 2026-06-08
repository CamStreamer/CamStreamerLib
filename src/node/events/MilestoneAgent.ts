import { ErrorWithResponse } from '../../errors/errors';
import { HttpRequestSender, HttpRequestOptions } from '../HttpRequestSender';
import {
    camerasResponseSchema,
    MilestoneAgentOptions,
    TBookmark,
    TMilestoneCamera,
    tokenResponseSchema,
} from '../../types/MilestoneAgent';

const CLIENT_ID = 'GrantValidatorClient';
const PAGE_SIZE = 100;
const TOKEN_EXPIRY_MARGIN_SEC = 60;

export class MilestoneAgent {
    private settings: Required<MilestoneAgentOptions>;
    private protocol: 'http:' | 'https:';
    private sender: HttpRequestSender;
    private token?: { value: string; expiresAt: number };

    constructor(options: MilestoneAgentOptions = {}) {
        this.settings = {
            protocol: options.protocol ?? 'https_insecure',
            ip: options.ip ?? '127.0.0.1',
            port: options.port ?? 443,
            user: options.user ?? '',
            pass: options.pass ?? '',
            timeout: options.timeout ?? 10000,
        };

        this.protocol = this.settings.protocol === 'http' ? 'http:' : 'https:';
        const tlsInsecure = this.settings.protocol === 'https_insecure';
        this.sender = new HttpRequestSender({ rejectUnaurhorized: !tlsInsecure });
    }

    async checkConnection() {
        await this.getToken(true);
        await this.getCamerasPage(0, 1);
    }

    async getAllCameras(): Promise<TMilestoneCamera[]> {
        const cameras: TMilestoneCamera[] = [];
        let page = 0;

        // Page through until a non-full page is returned
        for (;;) {
            const pageCameras = await this.getCamerasPage(page, PAGE_SIZE);
            cameras.push(...pageCameras);
            if (pageCameras.length < PAGE_SIZE) {
                break;
            }
            page += 1;
        }

        return cameras;
    }

    async sendBookmark(cameraId: string, bookmark: TBookmark) {
        const token = await this.getToken();
        const body = JSON.stringify({
            ...bookmark,
            devicePath: { type: 'cameras', id: cameraId },
        });

        const res = await this.sender.sendRequest(
            this.getRequestOptions('POST', '/api/rest/v1/bookmarks', token, {
                'Content-Type': 'application/json',
            }),
            body
        );

        if (!res.ok) {
            throw new ErrorWithResponse(res);
        }
    }

    private async getCamerasPage(page: number, size: number): Promise<TMilestoneCamera[]> {
        const token = await this.getToken();
        const res = await this.sender.sendRequest(
            this.getRequestOptions('GET', `/api/rest/v1/cameras?page=${page}&size=${size}`, token)
        );

        if (!res.ok) {
            throw new ErrorWithResponse(res);
        }

        const responseBody = await res.text();
        const result = await camerasResponseSchema.safeParseAsync(JSON.parse(responseBody));
        if (!result.success) {
            throw new Error(
                'Milestone get cameras failed: ' + JSON.stringify(result.error.issues) + '\n' + responseBody
            );
        }

        return result.data.array;
    }

    private async getToken(forceRefresh = false): Promise<string> {
        const nowSec = Date.now() / 1000;
        if (!forceRefresh && this.token !== undefined && this.token.expiresAt > nowSec) {
            return this.token.value;
        }

        const body = new URLSearchParams({
            grant_type: 'password',
            username: this.settings.user,
            password: this.settings.pass,
            client_id: CLIENT_ID,
        }).toString();

        const res = await this.sender.sendRequest(
            {
                method: 'POST',
                protocol: this.protocol,
                host: this.settings.ip,
                port: this.settings.port,
                path: '/idp/connect/token',
                timeout: this.settings.timeout,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                },
            },
            body
        );

        if (!res.ok) {
            throw new ErrorWithResponse(res);
        }

        const responseBody = await res.text();
        const result = await tokenResponseSchema.safeParseAsync(JSON.parse(responseBody));
        if (!result.success) {
            throw new Error(
                'Milestone authorization failed: ' + JSON.stringify(result.error.issues) + '\n' + responseBody
            );
        }

        this.token = {
            value: result.data.access_token,
            expiresAt: nowSec + result.data.expires_in - TOKEN_EXPIRY_MARGIN_SEC,
        };
        return this.token.value;
    }

    private getRequestOptions(
        method: string,
        path: string,
        token: string,
        extraHeaders?: Record<string, string>
    ): HttpRequestOptions {
        return {
            method,
            protocol: this.protocol,
            host: this.settings.ip,
            port: this.settings.port,
            path,
            timeout: this.settings.timeout,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                ...extraHeaders,
            },
        };
    }
}
