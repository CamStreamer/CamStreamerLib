import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

const timelinePost = z.object({
    postLocation: z.literal('timeline'),
    streamPrivacy: z.union([z.literal('public'), z.literal('friends'), z.literal('only_me')]),
});

const pagePost = z.object({
    postLocation: z.literal('page'),
    page: z.string(),
});

export const facebookSchema = streamCommonSchema.extend({
    type: z.literal('facebook'),
    description: z.string().optional(),
    deleteAfterEnd: z.boolean(),
    saveToSdCard: z.boolean(),
    statusCameraLed: z.boolean(),
    statusCameraOutput: z.string().nullable(),
    countdown: z.boolean(),
    post: z.discriminatedUnion('postLocation', [timelinePost, pagePost]),
});
