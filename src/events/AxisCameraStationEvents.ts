import { HttpOptions } from '../internal/types';
import { pad } from '../internal/utils';
import { THttpRequestOptions, TProxyParams } from '../types/common';
import { ProxyClient } from '../internal/ProxyClient';
import { DefaultClient } from '../node';

export class AxisCameraStationEvents {
    private client: DefaultClient;

    constructor(clientOptions: HttpOptions, private sourceKey: string) {
        this.client = new DefaultClient(clientOptions);
    }

    getClient(proxyParams?: TProxyParams) {
        return proxyParams ? new ProxyClient(this.client, proxyParams) : this.client;
    }

    async sendEvent(data: Record<string, string>, eventType: string, options?: THttpRequestOptions) {
        const dateString = this.getDate();
        const event = {
            addExternalDataRequest: {
                occurrenceTime: dateString,
                source: this.sourceKey,
                externalDataType: eventType,
                data: data,
            },
        };
        const eventData = JSON.stringify(event);

        const agent = this.getClient(options?.proxyParams);
        const res = await agent.post({
            path: '/Acs/Api/ExternalDataFacade/AddExternalData',
            data: eventData,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': eventData.length.toString(),
            },
            timeout: options?.timeout,
        });

        if (!res.ok) {
            throw new Error(`ACS status code: ${res.status}`);
        }
    }

    private getDate() {
        const date = new Date();
        const year = date.getUTCFullYear();
        const month = pad(date.getUTCMonth() + 1, 2);
        const day = pad(date.getUTCDate(), 2);
        const hours = pad(date.getUTCHours(), 2);
        const minutes = pad(date.getUTCMinutes(), 2);
        const seconds = pad(date.getUTCSeconds(), 2);

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
}
