import { HttpOptions, TKeyboardShortcuts } from '../internal/common';

export type CamSwitcherAPIOptions = HttpOptions;

export type TStreamInfo = {
    id: string;
    isTimeoutCustom: boolean;
    ptz_preset_pos_name: string;
    repeat: number;
    timeout: number;
    video: Record<string, string>;
    audio: Record<string, string>;
};
export type TPlaylistInfo = {
    channel: TChannelType;
    isFavourite: false;
    keyboard: object;
    loop: boolean;
    niceName: string;
    sortIndexFavourite: number;
    sortIndexOverview: number;
    stream_list: TStreamInfo[];
};
export type TPlaylistList = Record<string, TPlaylistInfo>;
export type TPlaylistQueue = {
    playlist_queue_list: string[];
};

export type TClipInfo = {
    niceName: string;
    channel: TChannelType;
    keyboard: object;
    sortIndexOverview: number;
};
export type TClipList = Record<string, TClipInfo>;
export type TApiClipType = 'audio' | 'video';
export type TClipStorage = 'SD_DISK' | 'FLASH';

export type TTrackerCameraListItem = {
    id: string;
    name: string;
    overview: boolean;
    zone: number[]; // 4
    playlist_name: string;
    ptz_preset_pos_no: number;
};
export type TTrackerInfo = {
    id: string;
    name: string;
    previewId: string;
    status: {
        video: string;
        audio: string;
    };
    duration: number;
    keyboard: TKeyboardShortcuts;
    channel: TChannelType;
    sortIndexOverview: number;
    width: number;
    height: number;
    fps: number;
    motion_history_frames: number;
    include_zone: number[][]; // 2[]
    include_node_ids: string[];
    camera_list: TTrackerCameraListItem[];
    viewNumber: number;
    camera_view_number: number;
};
export type TTrackerList = Record<string, TTrackerInfo>;

export type TStreamSourceInfo = {
    niceName: string;
    ip: string;
    mdnsName: string;
    port: number;
    enabled: boolean;
    auth: string;
    query: string;
    channel: TChannelType;
    keyboard: TKeyboardShortcuts;
    sortIndexOverview: number;
    viewNumber: number;
};
export type TStreamList = Record<string, TStreamSourceInfo>;

export type TOutputInfo = {
    rtsp_url: string;
    ws: string;
    ws_initial_message: string;
};
export type TAudioPushInfo = {
    ws: string;
    ws_initial_message: string;
};

export type TChannelType = 'audio' | 'video' | 'av';

export type TSilenceChannel = 'mono' | 'stereo';
export type TAvailableCameraList = { camera_list: { name: string; ip: string }[] };
export type TStorageInfo = {
    storage: TClipStorage;
    writable: boolean;
    size: number;
    available: number;
};

const cgiNames = {
    camera: 'streams',
    audio: 'audios',
    playlist: 'playlists',
    clip: 'clips',
    tracker: 'trackers',
};
export type TSourceType = keyof typeof cgiNames;
