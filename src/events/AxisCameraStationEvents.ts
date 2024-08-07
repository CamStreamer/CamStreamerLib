import { DefaultAgent } from '../DefaultAgent';
import { isClient, IClient, Options } from '../internal/common';

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
function getDate() {
    const date = new Date();
    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1, 2);
    const day = pad(date.getUTCDate(), 2);
    const hours = pad(date.getUTCHours(), 2);
    const minutes = pad(date.getUTCMinutes(), 2);
    const seconds = pad(date.getUTCSeconds(), 2);
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export type AcsEventsOptions = Options;

export class AxisCameraStationEvents {
    private client: IClient;

    constructor(private sourceKey: string, opt: AcsEventsOptions | IClient = {}) {
        if (isClient(opt)) {
            this.client = opt;
        } else {
            this.client = new DefaultAgent(opt);
        }
    }

    async sendEvent(data: Record<string, string>, eventType: string) {
        const dateString = getDate();
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
}
