import { HttpOptions, keyboardShortcutsSchema, networkCameraListSchema } from '../internal/common';
import { z } from 'zod';
import { toCamelCase, toCamelCaseDeep } from '../internal/transformers';

export type CamSwitcherAPIOptions = HttpOptions;

const channelTypeSchema = z.union([z.literal('audio'), z.literal('video'), z.literal('av')]);
export type TChannelType = z.infer<typeof channelTypeSchema>;
const audioChannelSchema = z.union([z.literal('mono'), z.literal('stereo')]);
export type TAudioChannel = z.infer<typeof audioChannelSchema>;
const audioChannelCountSchema = z.union([z.literal(1), z.literal(2)]);
export type TAudioChannelCount = z.infer<typeof audioChannelCountSchema>;
const h264ProfileSchema = z.union([z.literal('high'), z.literal('main'), z.literal('baseline')]);
export type TH264Profile = z.infer<typeof h264ProfileSchema>;
const clipStorageSchema = z.union([z.literal('SD_DISK'), z.literal('FLASH')]);
export type TClipStorage = z.infer<typeof clipStorageSchema>;

export const availableCameraListSchema = z.object({
    camera_list: networkCameraListSchema,
});

export const storageInfoListSchema = z.array(
    z.object({
        storage: z.union([z.literal('SD_DISK'), z.literal('FLASH')]),
        writable: z.boolean(),
        size: z.number(),
        available: z.number(),
    })
);
export type TStorageInfo = z.infer<typeof storageInfoListSchema>[number];

//   ----------------------------------------
//                 Websockets
//   ----------------------------------------

export const outputInfoSchema = z
    .object({
        rtsp_url: z.string(),
        ws: z.string(),
        ws_initial_message: z.string(),
    })
    .transform(toCamelCase);
export type TOutputInfo = z.infer<typeof outputInfoSchema>;

export const audioPushInfoSchema = z
    .object({
        ws: z.string(),
        ws_initial_message: z.string(),
    })
    .transform(toCamelCase);
export type TAudioPushInfo = z.infer<typeof audioPushInfoSchema>;

//   ----------------------------------------
//                   Sources
//   ----------------------------------------

const streamInfoSchema = z.object({
    niceName: z.string(),
    ip: z.string(),
    mdnsName: z.string(),
    port: z.number(),
    enabled: z.boolean(),
    auth: z.string(),
    query: z.string(),
    channel: channelTypeSchema,
    keyboard: keyboardShortcutsSchema,
    sortIndexOverview: z.number(),
    viewNumber: z.number(),
});
export type TStreamInfo = z.infer<typeof streamInfoSchema>;
export type TStreamInfoList = Record<string, TStreamInfo>;
export const streamInfoLoadSchema = z.record(z.string(), streamInfoSchema.partial());
export type TStreamInfoLoadList = z.infer<typeof streamInfoLoadSchema>;

export const clipInfoSchema = z.object({
    niceName: z.string(),
    channel: channelTypeSchema,
    keyboard: keyboardShortcutsSchema,
    sortIndexOverview: z.number(),
});
export type TClipInfo = z.infer<typeof clipInfoSchema>;
export type TClipInfoList = Record<string, TClipInfo>;
export const clipInfoLoadSchema = z.record(z.string(), clipInfoSchema.partial());
export type TClipInfoLoadList = z.infer<typeof clipInfoLoadSchema>;

const playlistInfoSchemaSnake = z.object({
    channel: channelTypeSchema,
    isFavourite: z.boolean(),
    keyboard: keyboardShortcutsSchema,
    loop: z.boolean(),
    niceName: z.string(),
    sortIndexFavourite: z.number(),
    sortIndexOverview: z.number(),
    stream_list: z.array(
        z.object({
            id: z.string(),
            isTimeoutCustom: z.boolean(),
            ptz_preset_pos_name: z.string(),
            repeat: z.number(),
            timeout: z.number(),
            video: z.record(z.string()),
            audio: z.record(z.string()),
        })
    ),
});
export const playlistInfoSchema = playlistInfoSchemaSnake.transform(toCamelCaseDeep);
export type TPlaylistInfo = z.infer<typeof playlistInfoSchema>;
export type TPlaylistInfoList = Record<string, TPlaylistInfo>;
export const playlistInfoLoadSchema = z
    .record(z.string(), playlistInfoSchemaSnake.partial())
    .transform(toCamelCaseDeep);
export type TPlaylistInfoLoadList = z.infer<typeof playlistInfoLoadSchema>;
export type TPlaylistStreamInfo = TPlaylistInfo['streamList'][number];

const trackerInfoSchemaSnake = z.object({
    id: z.string(),
    name: z.string(),
    previewId: z.string(),
    status: z.object({
        video: z.string(),
        audio: z.string(),
    }),
    duration: z.number(),
    keyboard: keyboardShortcutsSchema,
    channel: channelTypeSchema,
    sortIndexOverview: z.number(),
    width: z.number(),
    height: z.number(),
    fps: z.number(),
    motion_history_frames: z.number(),
    include_zone: z.array(z.array(z.number()).length(2)),
    include_node_ids: z.array(z.string()),
    camera_list: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            overview: z.boolean(),
            zone: z.array(z.number()).length(4),
            playlist_name: z.string(),
            ptz_preset_pos_no: z.number(),
        })
    ),
    viewNumber: z.number(),
    camera_view_number: z.number(),
});
export const trackerInfoSchema = trackerInfoSchemaSnake.transform(toCamelCaseDeep);
export type TTrackerInfo = z.infer<typeof trackerInfoSchema>;
export type TTrackerInfoList = Record<string, TTrackerInfo>;
export const trackerInfoLoadSchema = z.record(z.string(), trackerInfoSchemaSnake.partial()).transform(toCamelCaseDeep);
export type TrackerInfoLoadList = z.infer<typeof trackerInfoLoadSchema>;
export type TTrackerInfoCameraItem = TTrackerInfo['cameraList'][number];

//   ----------------------------------------
//                   Other
//   ----------------------------------------

export const playlistQueueSchema = z
    .object({
        playlist_queue_list: z.array(z.string()),
    })
    .transform(toCamelCaseDeep);
export type TPlaylistQueue = z.infer<typeof playlistQueueSchema>;

export const clipListSchema = z
    .object({
        clip_list: z.record(
            z.string(),
            z.object({
                storage: clipStorageSchema,
                duration: z.number(),
                stream_list: z.array(
                    z.union([
                        z.object({
                            type: z.literal('video'),
                            width: z.number(),
                            height: z.number(),
                            sample_rate: z.number(),
                            h264_profile: h264ProfileSchema,
                            h264_level: z.literal('4.1'),
                            gop: z.number(), // No idea why they on server call it gop ... its govLength
                            fps: z.number(),
                            bitrate: z.number(),
                        }),
                        z.object({
                            type: z.literal('audio'),
                            sample_rate: z.number(),
                            channel_count: audioChannelCountSchema,
                        }),
                    ])
                ),
            })
        ),
    })
    .transform(toCamelCaseDeep);
export type TClipList = z.infer<typeof clipListSchema>;

//   ----------------------------------------
//                   Config
//   ----------------------------------------
