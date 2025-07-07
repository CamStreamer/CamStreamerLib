import { HttpOptions } from '../internal/common';
import { z } from 'zod';

export type CamScripterOptions = HttpOptions;

export type TStorageType = 'INTERNAL' | 'SD_CARD';
export type TNodeState = 'OK' | 'NOT_INSTALLED' | 'NOT_FOUND';

export const packageInfoListSchema = z.array(
    z.object({
        storage: z.union([z.literal('SD_CARD'), z.literal('INTERNAL')]),
        manifest: z.object({
            package_name: z.string(),
            package_menu_name: z.string(),
            package_version: z.string(),
            vendor: z.string(),
            required_camscripter_version: z.string(),
            required_camscripter_rbi_version: z.string(),
            ui_link: z.string(),
        }),
    })
);
export type TPackageInfoList = z.infer<typeof packageInfoListSchema>;

export const storageSchema = z.array(
    z.object({
        type: z.union([z.literal('INTERNAL'), z.literal('SD_CARD')]),
        capacity_mb: z.number(),
    })
);
export type TStorage = z.infer<typeof storageSchema>;
