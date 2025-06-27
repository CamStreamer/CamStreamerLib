import { HttpOptions } from '../internal/common';
import { z } from 'zod';
import { toCamelCase, toCamelCaseDeep } from '../internal/transformers';
import {
    storageTypeSchema,
    keyboardShortcutsSchema,
    networkCameraListSchema,
    h264ProfileSchema,
    audioChannelCountSchema,
} from './common';

export type CamSwitcherAPIOptions = HttpOptions;

const channelTypeSchema = z.union([z.literal('audio'), z.literal('video'), z.literal('av')]);
export type TChannelType = z.infer<typeof channelTypeSchema>;
const playlistPlayTypeSchema = z.union([
    z.literal('PLAY_ALL'),
    z.literal('PLAY_ALL_LOOP'),
    z.literal('PLAY_ALL_SHUFFLED'),
    z.literal('PLAY_ALL_LOOP_SHUFFLED'),
    z.literal('PLAY_ONE_RANDOM'),
]);
export type TPlaylistPlayType = z.infer<typeof playlistPlayTypeSchema>;

export const availableCameraListSchema = z.object({
    camera_list: networkCameraListSchema,
});

export const storageInfoListSchema = z.array(
    z.object({
        storage: storageTypeSchema,
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

const streamSaveSchema = z.object({
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
export type TStreamSave = z.infer<typeof streamSaveSchema>;
export type TStreamSaveList = Record<string, TStreamSave>;
export const streamSaveLoadSchema = z.record(z.string(), streamSaveSchema.partial());
export type TStreamSaveLoadList = z.infer<typeof streamSaveLoadSchema>;

export const clipSaveSchema = z.object({
    niceName: z.string(),
    channel: channelTypeSchema,
    keyboard: keyboardShortcutsSchema,
    sortIndexOverview: z.number(),
});
export type TClipSave = z.infer<typeof clipSaveSchema>;
export type TClipSaveList = Record<string, TClipSave>;
export const clipSaveLoadSchema = z.record(z.string(), clipSaveSchema.partial());
export type TClipSaveLoadList = z.infer<typeof clipSaveLoadSchema>;

const playlistStreamSaveSchema = z
    .object({
        stream_name: z.string(),
        clip_name: z.string(),
        tracker_name: z.string(),
        storage: storageTypeSchema,
    })
    .partial();
const playlistSaveSchema = z.object({
    channel: channelTypeSchema,
    isFavourite: z.boolean(),
    keyboard: keyboardShortcutsSchema,
    niceName: z.string(),
    sortIndexFavourite: z.number(),
    sortIndexOverview: z.number(),
    play_type: playlistPlayTypeSchema,
    default: z.boolean().optional(),
    stream_list: z.array(
        z.object({
            id: z.string(),
            isTimeoutCustom: z.boolean(),
            ptz_preset_pos_name: z.string(),
            repeat: z.number(),
            timeout: z.number(),
            video: playlistStreamSaveSchema,
            audio: playlistStreamSaveSchema.optional(),
        })
    ),
});
export type TPlaylistSave = z.infer<typeof playlistSaveSchema>;
export type TPlaylistSaveList = Record<string, TPlaylistSave>;
export const playlistSaveLoadSchema = z.record(z.string(), playlistSaveSchema.partial());
export type TPlaylistSaveLoadList = z.infer<typeof playlistSaveLoadSchema>;
export type TPlaylistStreamSave = TPlaylistSave['stream_list'][number];

export const trackerSaveSchema = z.object({
    id: z.string(),
    name: z.string(),
    previewId: z.string(),
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
export type TTrackerSave = z.infer<typeof trackerSaveSchema>;
export type TTrackerSaveList = Record<string, TTrackerSave>;
export const trackerSaveLoadSchema = z.record(z.string(), trackerSaveSchema.partial());
export type TrackerSaveLoadList = z.infer<typeof trackerSaveLoadSchema>;
export type TTrackerSaveCameraItem = TTrackerSave['camera_list'][number];

//   ----------------------------------------
//                   Other
//   ----------------------------------------

export const playlistQueueSchema = z
    .object({
        playlist_queue_list: z.array(z.string()),
    })
    .transform(toCamelCaseDeep);

export const clipListSchema = z.object({
    clip_list: z.record(
        z.string(),
        z.object({
            storage: storageTypeSchema,
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
});
export type TClipList = z.infer<typeof clipListSchema>['clip_list'];

//   ----------------------------------------
//                   Config
//   ----------------------------------------
