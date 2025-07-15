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

export class ParsingBlobError extends Error {
    constructor(err: unknown) {
        super('Error parsing response as Blob: ' + err);
        this.name = 'ParsingBlobError';
    }
}

type TApplicationAPIAction = 'START' | 'RESTART' | 'STOP';

export class ApplicationAPIError extends Error {
    constructor(action: TApplicationAPIAction, res: string) {
        super(`[APP ${action}] Error: ` + res);
        this.name = 'ApplicationAPIError';
    }
}

type TSDCardAction = 'MOUNT' | 'UNMOUNT';

export class SDCardActionError extends Error {
    constructor(action: TSDCardAction, res: string) {
        super(`[SD_CARD ${action}] Error: ` + res);
        this.name = 'SDCardActionError';
    }
}

export class SDCardJobError extends Error {
    constructor() {
        super('Error while fetching SD card job progress');
        this.name = 'SDCardJobError';
    }
}

type TMaxFPSErrorType = 'MALFORMED_REPLY' | 'CHANNEL_NOT_FOUND' | 'CAPTURE_MODE_NOT_FOUND' | 'FPS_NOT_SPECIFIED';

const MAX_FPS_ERROR_MESSAGES: Record<TMaxFPSErrorType, string> = {
    MALFORMED_REPLY: 'Malformed reply from camera',
    CHANNEL_NOT_FOUND: 'Video channel not found.',
    CAPTURE_MODE_NOT_FOUND: 'No enabled capture mode found.',
    FPS_NOT_SPECIFIED: 'Max fps not specified for given capture mode.',
};

export class MaxFPSError extends Error {
    constructor(state: TMaxFPSErrorType) {
        super(`[MAX_FPS ${state}] Error: ` + MAX_FPS_ERROR_MESSAGES[state]);
        this.name = 'MaxFPSError';
    }
}

export class NoDeviceInfoError extends Error {
    constructor() {
        super('Did not get any data from remote camera');
        this.name = 'NoDeviceInfoError';
    }
}

export class FetchDeviceInfoError extends Error {
    constructor(err: unknown) {
        super('Error fetching remote camera data: ' + err);
        this.name = 'NoDeviceInfoFromCameraError';
    }
}

export class AddNewClipError extends Error {
    constructor(message: string) {
        super('Error adding new clip: ' + message);
        this.name = 'AddNewClipError';
    }
}

export class PtzNotSupportedError extends Error {
    constructor() {
        super('Ptz not supported.');
        this.name = 'PtzNotSupportedError';
    }
}
