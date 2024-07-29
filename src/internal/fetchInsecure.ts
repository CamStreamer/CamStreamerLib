import * as undici from 'undici';

export function fetchInsecure(req: Request, init: RequestInit) {
    const insecureAgent = new undici.Agent({
        connect: {
            rejectUnauthorized: false,
        },
    });

    return undici.fetch(req as undici.Request, {
        ...init,
        dispatcher: insecureAgent,
    });
}
