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

export class JsonParseError extends Error {
    constructor(paramName: string, data: unknown) {
        super(`Error: in JSON parsing of ${paramName}. Cannot parse: ${data}`);
        this.name = 'JsonParseError';
    }
}

export class ParameterNotFoundError extends Error {
    constructor(paramName: string) {
        super(`Error: no parameter '${paramName}' was found`);
        this.name = 'ParameterNotFoundError';
    }
}

export class SettingParameterError extends Error {
    constructor(message: string) {
        super(`Error setting parameter to camera: ${message}`);
        this.name = 'SettingParameterError';
    }
}

type TApplicationAPIAction = 'START' | 'RESTART' | 'STOP' | 'INSTALL';

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

export class StorageDataFetchError extends Error {
    constructor(err: unknown) {
        super('Error fetching storage data: ' + err);
        this.name = 'StorageDataFetchError';
    }
}

export class WsAuthorizationError extends Error {
    constructor(message: string) {
        super('Server error on ws authorization: ' + message);
        this.name = 'WsAuthorizationError';
    }
}

export class UtcTimeFetchError extends Error {
    constructor(message: string) {
        super('Server error on get UTC time: ' + message);
        this.name = 'UtcTimeFetchError';
    }
}

export class TimezoneNotSetupError extends Error {
    constructor() {
        super('Time zone not setup on the device');
        this.name = 'TimezoneNotSetupError';
    }
}

export class TimezoneFetchError extends Error {
    constructor(err: unknown) {
        super('Error fetching time zone information: ' + err);
        this.name = 'TimezoneFetchError';
    }
}

type TCalibrationType = 'PTZ' | 'FOCUS';

export class ResetCalibrationError extends Error {
    constructor(type: TCalibrationType, err: unknown) {
        super('Error resetting ' + type.toLowerCase() + ' calibration: ' + err);
        this.name = 'ResetCalibrationError';
    }
}
export class ImportSettingsError extends Error {
    constructor(err: unknown) {
        super('Error importing settings: ' + err);
        this.name = 'ImportSettingsError';
    }
}
export class CannotSetCoordsInAutoModeError extends Error {
    constructor() {
        super("The automatic mode doesn't allow control of the camera.");
        this.name = 'CannotSetCoordsInAutoModeError';
    }
}
export class InvalidLatLngError extends Error {
    constructor() {
        super('The provided latitude or longitude parameters are invalid.');
        this.name = 'InvalidLatLngError';
    }
}
export class InvalidAltitudeError extends Error {
    constructor() {
        super('The provided altitude parameter is invalid.');
        this.name = 'InvalidAltitudeError';
    }
}
export class ServerError extends Error {
    constructor() {
        super('An internal server error occurred.');
        this.name = 'ServerError';
    }
}

export class BadRequestError extends Error {
    constructor(err: unknown) {
        super('An unknown error occurred: ' + err);
        this.name = 'UnknownError';
    }
}
