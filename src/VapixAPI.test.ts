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

const VALID_APP_XML =
    '<application Name="vmd" NiceName="AXIS Video Motion Detection" Vendor="Axis Communications" Version="4.4-5" ApplicationID="143440" License="None" Status="Stopped" ConfigurationPage="local/vmd/config.html" VendorHomePage="http://www.axis.com" LicenseName="Proprietary" />';

const VALID_APP = {
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
                VALID_APP,
            ]);
            expect(debugSpy).toHaveBeenCalledTimes(1);
            expect(debugSpy.mock.calls[0]).toContainEqual(
                expect.objectContaining({ License: 'None', Status: 'Stopped' })
            );
        });

        test.each([
            {
                name: 'an entry without a name',
                xml: `<reply result="ok">${VALID_APP_XML}<application License="None" Status="Stopped" /></reply>`,
                expected: [VALID_APP],
                skipped: 1,
            },
            {
                name: 'a named entry missing informational fields',
                xml: `<reply result="ok">${VALID_APP_XML}<application Name="broken" License="None" Status="Stopped" /></reply>`,
                expected: [VALID_APP],
                skipped: 1,
            },
            {
                name: 'a list of only invalid entries',
                xml: '<reply result="ok"><application License="None" Status="Stopped" /><application Name="broken" License="None" Status="Stopped" /></reply>',
                expected: [],
                skipped: 2,
            },
        ])('skips invalid entries individually: $name', async ({ xml, expected, skipped }) => {
            const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});

            await expect(createApi(xml).getApplicationList()).resolves.toEqual(expected);
            expect(debugSpy).toHaveBeenCalledTimes(skipped);
        });

        test.each([
            {
                name: 'a single application',
                xml: '<reply result="ok"><application Name="camoverlay" NiceName="CamOverlay App" Vendor="CamStreamer" Version="3.0-1" License="None" Status="Running" /></reply>',
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
                name: 'an application with an attribute outside the schema',
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
                name: 'no applications',
                xml: '<reply result="ok"></reply>',
                expected: [],
            },
        ])('returns valid-only lists unchanged: $name', async ({ xml, expected }) => {
            const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});

            await expect(createApi(xml).getApplicationList()).resolves.toEqual(expected);
            expect(debugSpy).not.toHaveBeenCalled();
        });
    });
});
