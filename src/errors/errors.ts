export class ServiceUnavailableError extends Error {
    constructor() {
        super('Service is unavailable.');
        this.name = 'ServiceUnavailableError';
    }
}

export class ServiceNotFoundError extends Error {
    constructor() {
        super('Service not found.');
        this.name = 'ServiceNotFoundError';
    }
}
