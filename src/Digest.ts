import * as crypto from 'crypto';

export class Digest {
    static getAuthHeader(user: string, pass: string, method: string, uri: string, wwwAuthenticateHeader: string) {
        const digestItems: Record<string, string> = {};
        const digestArr = wwwAuthenticateHeader.substring(wwwAuthenticateHeader.indexOf('Digest') + 6).split(',');

        for (let i = 0; i < digestArr.length; i++) {
            const pos = digestArr[i].indexOf('=');
            const key = digestArr[i].substring(0, pos).trim();
            const value = digestArr[i].substring(pos + 1).trim();
            digestItems[key] = value.replace(/"/g, '');
        }

        const HA1 = crypto.createHash('md5').update(`${user}:${digestItems['realm']}:${pass}`).digest('hex');
        const HA2 = crypto.createHash('md5').update(`${method}:${uri}`).digest('hex');
        let response: string;
        if (digestItems['qop'] !== undefined) {
            response = crypto
                .createHash('md5')
                .update(`${HA1}:${digestItems['nonce']}:00000001:162d50aa594e9648:auth:${HA2}`)
                .digest('hex');
        } else {
            response = crypto.createHash('md5').update(`${HA1}:${digestItems['nonce']}:${HA2}`).digest('hex');
        }

        let header =
            'Digest ' +
            `username="${user}",` +
            `realm="${digestItems['realm']}",` +
            `nonce="${digestItems['nonce']}",` +
            `uri="${uri}",` +
            `response="${response}"`;

        if (digestItems['qop'] !== undefined) {
            header += ',qop=auth,nc=00000001,cnonce="162d50aa594e9648"';
        }

        return header;
    }
}
