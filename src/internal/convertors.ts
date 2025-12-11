import { TInternalVapixParameters, TVideoCodec } from '../types/CamStreamerAPI';
import { TBitrateMode, TBitrateVapixParams, TH264Profile } from '../types/common';
import { FIRMWARE_WITH_BITRATE_MODES_SUPPORT, FIRMWARE_WITH_OVERLAYS_SUPPORT } from './constants';
import { isFirmwareVersionAtLeast } from './versionCompare';

// BITRATE OPTIONS <-> BITRATE VAPIX PARAMETERS CONVERTORS

export const parseBitrateOptionsToVapixParams = (
    firmWareVersion: string,
    bitrateMode: TBitrateMode | undefined,
    cameraOptions: Partial<TBitrateVapixParams>
): string => {
    if (!isFirmwareVersionAtLeast(firmWareVersion, FIRMWARE_WITH_BITRATE_MODES_SUPPORT)) {
        return `videomaxbitrate=${cameraOptions.maximumBitRate}`;
    }

    if (bitrateMode === undefined) {
        return '';
    }

    const data: Record<TBitrateMode, string> = {
        VBR: 'videobitratemode=vbr',
        MBR: `videobitratemode=mbr&videomaxbitrate=${cameraOptions.maximumBitRate}&videobitratepriority=framerate`,
        ABR: `videobitratemode=abr&videoabrtargetbitrate=${cameraOptions.maximumBitRate}&videoabrretentiontime=${cameraOptions.retentionTime}&videoabrmaxbitrate=${cameraOptions.bitRateLimit}`,
    };

    return data[bitrateMode];
};

export const parseVapixParamsToBitrateOptions = (bitrateVapixParams: string): TBitrateVapixParams => {
    const params: Record<string, string> = {};

    const searchParams = new URLSearchParams(bitrateVapixParams);
    searchParams.forEach((value, key) => {
        params[key] = value;
    });

    const bitrateMode = params['videobitratemode'] !== undefined ? params['videobitratemode'].toUpperCase() : undefined;

    // Lower firmware version does not support bitrate modes and has only videomaxbitrate param
    const hasLowerFw = bitrateMode === undefined && params['videomaxbitrate'] !== undefined;
    if (hasLowerFw) {
        const maximumBitRate = parseInt(params['videomaxbitrate'] ?? '0', 10);
        return {
            bitrateMode: 'MBR',
            maximumBitRate: maximumBitRate,
            retentionTime: 1,
            bitRateLimit: Math.floor(maximumBitRate * 1.1),
        };
    }

    if (bitrateMode === 'ABR') {
        const maximumBitRate = parseInt(params['videoabrtargetbitrate'] ?? '0', 10);
        const retentionTime = parseInt(params['videoabrretentiontime'] ?? '0', 10);
        const bitRateLimit = parseInt(params['videoabrmaxbitrate'] ?? '0', 10);

        return {
            bitrateMode,
            maximumBitRate,
            retentionTime,
            bitRateLimit,
        };
    } else if (bitrateMode === 'MBR') {
        const maximumBitRate = params['videomaxbitrate'] !== undefined ? parseInt(params['videomaxbitrate'], 10) : null;
        const oldMaximumBitrateParamValue = parseInt(params['videombrmaxbitrate'] ?? '0', 10);

        return {
            bitrateMode: bitrateMode,
            maximumBitRate: maximumBitRate ?? oldMaximumBitrateParamValue,
            retentionTime: 1,
            bitRateLimit: Math.floor(maximumBitRate ?? oldMaximumBitrateParamValue * 1.1),
        };
    }

    return {
        bitrateMode: bitrateMode as TBitrateMode,
        retentionTime: 1,
        maximumBitRate: 0,
        bitRateLimit: 0,
    };
};

// VIDEO OPTIONS <-> VAPIX PARAMETERS CONVERTORS

export const parseVideoOptionsToVapixParams = (firmWareVersion: string, video: TInternalVapixParameters): string => {
    const bitrateParams = parseBitrateOptionsToVapixParams(firmWareVersion, video.bitrateMode, {
        maximumBitRate: video.maximumBitRate,
        retentionTime: video.retentionTime,
        bitRateLimit: video.bitRateLimit,
    });

    let overlaysParams = '';
    if (isFirmwareVersionAtLeast(firmWareVersion, FIRMWARE_WITH_OVERLAYS_SUPPORT)) {
        overlaysParams = `&overlays=${video.overlays}`;
    }

    const nbrOfChannels = video.audio === 1 ? `&nbrOfChannels=${video.nbrOfChannels}` : '';
    const audioParams = `audio=${video.audio}${nbrOfChannels}`;

    const videoCodecParams =
        video.videoCodec === 'h264'
            ? `videoCodec=${video.videoCodec}&h264Profile=${video.h264Profile}`
            : `videoCodec=${video.videoCodec}`;

    const videoParams = `camera=${video.camera}&resolution=${video.resolution}&fps=${video.fps}&compression=${video.compression}&videokeyframeinterval=${video.govLength}&${videoCodecParams}${overlaysParams}`;

    return [videoParams, bitrateParams, audioParams].join('&');
};

export const parseVapixParamsToVideoOptions = (internalVapixParams: string): TInternalVapixParameters => {
    const bitrateOptions = parseVapixParamsToBitrateOptions(internalVapixParams);

    const params: Record<string, string> = {};

    const searchParams = new URLSearchParams(internalVapixParams);
    searchParams.forEach((value, key) => {
        params[key] = value;
    });

    let h264Profile = undefined;
    if (params['videoCodec'] === 'h264') {
        h264Profile = (params['h264Profile'] ?? 'high') as TH264Profile;
    }

    let nbrOfChannels = undefined;
    if (params['audio'] === '1') {
        nbrOfChannels = parseInt(params['nbrOfChannels'] ?? '1') as 1 | 2;
    }

    return {
        ...bitrateOptions,
        camera: params['camera'] ?? '1',
        resolution: params['resolution'] ?? '',
        fps: parseInt(params['fps'] ?? '0', 10),
        compression: parseInt(params['compression'] ?? '0', 10),
        govLength: parseInt(params['videokeyframeinterval'] ?? '0', 10),
        videoCodec: (params['videoCodec'] ?? 'h264') as TVideoCodec,
        h264Profile,
        audio: parseInt(params['audio'] ?? '0') as 0 | 1,
        nbrOfChannels,
        overlays: params['overlays'] as TInternalVapixParameters['overlays'],
    };
};
