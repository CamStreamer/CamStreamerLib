import { DefaultClient } from '../node/DefaultClient';
import { IClient, HttpOptions } from '../internal/types';
import { isClient, pad } from '../internal/utils';
import { Response } from 'undici';

export type AcsEventsOptions = HttpOptions;

export class AxisCameraStationEvents {
    private client: IClient<Response>;

    constructor(private sourceKey: string, opt: AcsEventsOptions | IClient<Response> = {}) {
        if (isClient(opt)) {
            this.client = opt;
        } else {
            this.client = new DefaultClient(opt);
        }
    }

    async sendEvent(data: Record<string, string>, eventType: string) {
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

        const res = await this.client.post('/Acs/Api/ExternalDataFacade/AddExternalData', eventData, undefined, {
            'Content-Type': 'application/json',
            'Content-Length': eventData.length.toString(),
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
