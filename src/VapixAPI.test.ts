import { VapixAPI } from './VapixAPI';
import { IClient, TResponse } from './internal/types';

import { describe, test, expect, jest, afterEach } from '@jest/globals';

const createApi = (xml: string) => {
    const client: IClient<TResponse, unknown> = {
        get: () => Promise.resolve(new Response(xml)),
        post: () => Promise.reject(new Error('unused')),
    };
    return new VapixAPI(client);
};

describe('VapixAPI', () => {
    describe('getApplicationList', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        test('skips the nameless entry of the live camera list', async () => {
            const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
            const api = createApi(`<reply result="ok">
 <application Name="camstreamer" NiceName="CamStreamer App" Vendor="CamStreamer" Version="5.0-15" ApplicationID="413135" License="None" Status="Running" ConfigurationPage="local/camstreamer/settings.html" />
 <application Name="" License="None" Status="Stopped" />
 <application Name="vmd" NiceName="AXIS Video Motion Detection" Vendor="Axis Communications" Version="4.4-5" ApplicationID="143440" License="None" Status="Stopped" ConfigurationPage="local/vmd/config.html" VendorHomePage="http://www.axis.com" LicenseName="Proprietary" />
</reply>`);

            await expect(api.getApplicationList()).resolves.toEqual([
                {
                    Name: 'camstreamer',
                    NiceName: 'CamStreamer App',
                    Vendor: 'CamStreamer',
                    Version: '5.0-15',
                    ApplicationID: '413135',
                    License: 'None',
                    Status: 'Running',
                    ConfigurationPage: 'local/camstreamer/settings.html',
                    appId: 'CamStreamer',
                },
                {
                    Name: 'vmd',
                    NiceName: 'AXIS Video Motion Detection',
                    Vendor: 'Axis Communications',
                    Version: '4.4-5',
                    ApplicationID: '143440',
                    License: 'None',
                    Status: 'Stopped',
                    ConfigurationPage: 'local/vmd/config.html',
                    VendorHomePage: 'http://www.axis.com',
                    LicenseName: 'Proprietary',
                    appId: null,
                },
            ]);
            expect(debugSpy).toHaveBeenCalledTimes(1);
            expect(debugSpy.mock.calls[0]).toContainEqual({ Name: '', License: 'None', Status: 'Stopped' });
        });

        test.each([
            {
                name: 'an entry without a name',
                xml: '<reply result="ok"><application Name="vmd" NiceName="AXIS Video Motion Detection" Vendor="Axis Communications" Version="4.4-5" License="None" Status="Stopped" /><application License="None" Status="Stopped" /></reply>',
                expected: [
                    {
                        Name: 'vmd',
                        NiceName: 'AXIS Video Motion Detection',
                        Vendor: 'Axis Communications',
                        Version: '4.4-5',
                        License: 'None',
                        Status: 'Stopped',
                        appId: null,
                    },
                ],
            },
            {
                name: 'a named entry missing informational fields',
                xml: '<reply result="ok"><application Name="vmd" NiceName="AXIS Video Motion Detection" Vendor="Axis Communications" Version="4.4-5" License="None" Status="Stopped" /><application Name="broken" License="None" Status="Stopped" /></reply>',
                expected: [
                    {
                        Name: 'vmd',
                        NiceName: 'AXIS Video Motion Detection',
                        Vendor: 'Axis Communications',
                        Version: '4.4-5',
                        License: 'None',
                        Status: 'Stopped',
                        appId: null,
                    },
                ],
            },
        ])('skips invalid entries individually: $name', async ({ xml, expected }) => {
            const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});

            await expect(createApi(xml).getApplicationList()).resolves.toEqual(expected);
            expect(debugSpy).toHaveBeenCalledTimes(1);
        });

        test.each([
            {
                name: 'drops attributes outside the schema',
                xml: '<reply result="ok"><application Name="camoverlay" NiceName="CamOverlay App" Vendor="CamStreamer" Version="3.0-1" License="None" Status="Running" Unexpected="value" /></reply>',
                expected: [
                    {
                        Name: 'camoverlay',
                        NiceName: 'CamOverlay App',
                        Vendor: 'CamStreamer',
                        Version: '3.0-1',
                        License: 'None',
                        Status: 'Running',
                        appId: 'CamOverlay',
                    },
                ],
            },
            {
                name: 'maps an application outside the core CamStreamer apps to its appId',
                xml: '<reply result="ok"><application Name="sporttracker" NiceName="SportTracker App" Vendor="CamStreamer" Version="1.0-1" License="None" Status="Running" /></reply>',
                expected: [
                    {
                        Name: 'sporttracker',
                        NiceName: 'SportTracker App',
                        Vendor: 'CamStreamer',
                        Version: '1.0-1',
                        License: 'None',
                        Status: 'Running',
                        appId: 'SportTracker',
                    },
                ],
            },
            {
                name: 'maps a capitalised application name to its appId',
                xml: '<reply result="ok"><application Name="CamOverlay" NiceName="CamOverlay App" Vendor="CamStreamer" Version="3.0-1" License="None" Status="Running" /></reply>',
                expected: [
                    {
                        Name: 'CamOverlay',
                        NiceName: 'CamOverlay App',
                        Vendor: 'CamStreamer',
                        Version: '3.0-1',
                        License: 'None',
                        Status: 'Running',
                        appId: 'CamOverlay',
                    },
                ],
            },
            {
                name: 'returns an empty list when the camera has no applications',
                xml: '<reply result="ok"></reply>',
                expected: [],
            },
        ])('returns every valid entry with its appId and logs nothing: $name', async ({ xml, expected }) => {
            const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});

            await expect(createApi(xml).getApplicationList()).resolves.toEqual(expected);
            expect(debugSpy).not.toHaveBeenCalled();
        });
    });
});
