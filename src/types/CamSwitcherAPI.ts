import { HttpOptions, keyboardShortcutsSchema } from '../internal/common';
import { z } from 'zod';

export type CamSwitcherAPIOptions = HttpOptions;

export type TChannelType = 'audio' | 'video' | 'av';
export type TSilenceChannel = 'mono' | 'stereo';
export type TApiClipType = 'audio' | 'video';
export type TClipStorage = 'SD_DISK' | 'FLASH';

export const streamInfoSchema = z.object({
    id: z.string(),
    isTimeoutCustom: z.boolean(),
    ptz_preset_pos_name: z.string(),
    repeat: z.number(),
    timeout: z.number(),
    video: z.record(z.string()),
    audio: z.record(z.string()),
});
export type TStreamInfo = z.infer<typeof streamInfoSchema>;

export const playlistInfoSchema = z.object({
    channel: z.union([z.literal('audio'), z.literal('video'), z.literal('av')]),
    isFavourite: z.boolean(),
    keyboard: keyboardShortcutsSchema,
    loop: z.boolean(),
    niceName: z.string(),
    sortIndexFavourite: z.number(),
    sortIndexOverview: z.number(),
    stream_list: z.array(streamInfoSchema),
});
export type TPlaylistInfo = z.infer<typeof playlistInfoSchema>;
export const playlistListSchema = z.record(z.string(), playlistInfoSchema);
export type TPlaylistList = z.infer<typeof playlistListSchema>;

export const playlistQueueSchema = z.object({
    playlist_queue_list: z.array(z.string()),
});
export type TPlaylistQueue = z.infer<typeof playlistQueueSchema>;

export const clipInfoSchema = z.object({
    niceName: z.string(),
    channel: z.union([z.literal('audio'), z.literal('video'), z.literal('av')]),
    keyboard: keyboardShortcutsSchema,
    sortIndexOverview: z.number(),
});

export type TClipInfo = z.infer<typeof clipInfoSchema>;
export const clipListSchema = z.record(z.string(), clipInfoSchema);
export type TClipList = z.infer<typeof clipListSchema>;

export const trackerCameraListItemSchema = z.object({
    id: z.string(),
    name: z.string(),
    overview: z.boolean(),
    zone: z.array(z.number()).length(4),
    playlist_name: z.string(),
    ptz_preset_pos_no: z.number(),
});
export type TTrackerCameraListItem = z.infer<typeof trackerCameraListItemSchema>;

export const trackerInfoSchema = z.object({
    id: z.string(),
    name: z.string(),
    previewId: z.string(),
    status: z.object({
        video: z.string(),
        audio: z.string(),
    }),
    duration: z.number(),
    keyboard: keyboardShortcutsSchema,
    channel: z.union([z.literal('audio'), z.literal('video'), z.literal('av')]),
    sortIndexOverview: z.number(),
    width: z.number(),
    height: z.number(),
    fps: z.number(),
    motion_history_frames: z.number(),
    include_zone: z.array(z.array(z.number()).length(2)),
    include_node_ids: z.array(z.string()),
    camera_list: z.array(trackerCameraListItemSchema),
    viewNumber: z.number(),
    camera_view_number: z.number(),
});
export type TTrackerInfo = z.infer<typeof trackerInfoSchema>;
export const trackerListSchema = z.record(z.string(), trackerInfoSchema);
export type TTrackerList = z.infer<typeof trackerListSchema>;

const streamSourceInfoSchema = z.object({
    niceName: z.string(),
    ip: z.string(),
    mdnsName: z.string(),
    port: z.number(),
    enabled: z.boolean(),
    auth: z.string(),
    query: z.string(),
    channel: z.union([z.literal('audio'), z.literal('video'), z.literal('av')]),
    keyboard: keyboardShortcutsSchema,
    sortIndexOverview: z.number(),
    viewNumber: z.number(),
});
export type TStreamSourceInfo = z.infer<typeof streamSourceInfoSchema>;
export const streamListSchema = z.record(z.string(), streamSourceInfoSchema);
export type TStreamList = z.infer<typeof streamListSchema>;

export const outputInfoSchema = z.object({
    rtsp_url: z.string(),
    ws: z.string(),
    ws_initial_message: z.string(),
});
export type TOutputInfo = z.infer<typeof outputInfoSchema>;

export const audioPushInfoSchema = z.object({
    ws: z.string(),
    ws_initial_message: z.string(),
});
export type TAudioPushInfo = z.infer<typeof audioPushInfoSchema>;

export const availableCameraListSchema = z.object({
    camera_list: z.array(
        z.object({
            name: z.string(),
            ip: z.string(),
        })
    ),
});
export type TAvailableCameraList = z.infer<typeof availableCameraListSchema>;

export const storageInfoListSchema = z.array(
    z.object({
        storage: z.union([z.literal('SD_DISK'), z.literal('FLASH')]),
        writable: z.boolean(),
        size: z.number(),
        available: z.number(),
    })
);
export type TStorageInfoList = z.infer<typeof storageInfoListSchema>;

const cgiNames = {
    camera: 'streams',
    audio: 'audios',
    playlist: 'playlists',
    clip: 'clips',
    tracker: 'trackers',
};
export type TSourceType = keyof typeof cgiNames;
