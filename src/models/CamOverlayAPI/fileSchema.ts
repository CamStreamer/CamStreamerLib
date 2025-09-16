import { z } from 'zod';

export const storageSchema = z.union([
    z.literal('flash'),
    z.literal('SD0'),
    z.literal('ftp'),
    z.literal('samba'),
    z.literal('url'),
]);
export const fileSchema = z.object({
    name: z.string(),
    path: z.string().url(),
    storage: storageSchema,
});
export const storageDataListSchema = z.array(
    z.object({
        type: storageSchema,
        state: z.string(),
    })
);
export const storageResponseSchema = z.object({
    code: z.number(),
    list: storageDataListSchema,
});

export const fileListSchema = z.array(fileSchema);
export const fileDataSchema = z.object({
    code: z.number(),
    list: fileListSchema,
});
