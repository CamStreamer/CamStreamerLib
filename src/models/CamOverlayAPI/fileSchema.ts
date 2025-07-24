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
export const fileListSchema = z.array(fileSchema);
