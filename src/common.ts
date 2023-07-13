export type Options = {
    ip?: string;
    port?: number;
    auth?: string;
    tls?: boolean;
    tlsInsecure?: boolean; // Ignore HTTPS certificate validation (insecure)
};
