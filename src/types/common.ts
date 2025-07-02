import { z } from 'zod';

export const audioChannelSchema = z.union([z.literal('mono'), z.literal('stereo')]);
export type TAudioChannel = z.infer<typeof audioChannelSchema>;

export const audioChannelCountSchema = z.union([z.literal(1), z.literal(2)]);
export type TAudioChannelCount = z.infer<typeof audioChannelCountSchema>;

export const h264ProfileSchema = z.union([z.literal('high'), z.literal('main'), z.literal('baseline')]);
export type TH264Profile = z.infer<typeof h264ProfileSchema>;

export const storageTypeSchema = z.union([z.literal('SD_DISK'), z.literal('FLASH')]);
export type TStorageType = z.infer<typeof storageTypeSchema>;

export const networkCameraListSchema = z.array(
    z.object({
        name: z.string(),
        ip: z.string(),
    })
);
export type TNetworkCamera = z.infer<typeof networkCameraListSchema>[number];

export const keyboardShortcutSchema = z.string().nullable();
export const keyboardShortcutsSchema = z.record(keyboardShortcutSchema);
export type TKeyboardShortcut = z.infer<typeof keyboardShortcutSchema>;
export type TKeyboardShortcuts = z.infer<typeof keyboardShortcutsSchema>;
