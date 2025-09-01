import { HttpOptions } from '../internal/types';
import { z } from 'zod';

export type CamScripterOptions = HttpOptions;

export type TStorageType = 'INTERNAL' | 'SD_CARD';

export const nodeStateSchema = z.object({
    node_state: z.union([z.literal('OK'), z.literal('NOT_INSTALLED'), z.literal('NOT_FOUND')]),
});
export type TNodeState = z.infer<typeof nodeStateSchema>;

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

export const packageConfigSchema = z.record(z.string(), z.object({ enabled: z.boolean() }));
export type TPackageConfig = z.infer<typeof packageConfigSchema>;

export const storageSchema = z.union([
    z.tuple([
        z.object({ type: z.literal('INTERNAL'), capacity_mb: z.number() }),
        z.object({ type: z.literal('SD_CARD'), capacity_mb: z.number() }),
    ]),
    z.tuple([z.object({ type: z.literal('INTERNAL'), capacity_mb: z.number() })]),
]);
export type TStorage = z.infer<typeof storageSchema>;
export type TStorageParsedData = {
    size: number;
    storageType: TStorageType;
}[];

export const camscripterApiResponseSchema = z.object({
    status: z.number(),
    message: z.string(),
});
export type TCamscripterApiResponse = z.infer<typeof camscripterApiResponseSchema>;
