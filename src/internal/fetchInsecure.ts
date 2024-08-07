import * as undici from 'undici';

export function fetchInsecure(req: undici.Request, init: RequestInit) {
    const insecureAgent = new undici.Agent({
        connect: {
            rejectUnauthorized: false,
        },
    });

    return undici.fetch(req, {
        ...init,
        dispatcher: insecureAgent,
    });
}
export const Request = undici.Request;
