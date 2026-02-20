import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

const timelinePostSchema = z.object({
    postLocation: z.literal('timeline'),
    streamPrivacy: z.union([z.literal('public'), z.literal('friends'), z.literal('only_me')]),
});
export type TTimeLinePost = z.infer<typeof timelinePostSchema>;
export type TFacebookStreamPrivacy = TTimeLinePost['streamPrivacy'];

const pagePostSchema = z.object({
    postLocation: z.literal('page'),
    page: z.string(),
});
export type TPagePost = z.infer<typeof pagePostSchema>;
export const postSchema = z.discriminatedUnion('postLocation', [timelinePostSchema, pagePostSchema]);
export const facebookSchema = streamCommonSchema.extend({
    platform: z.literal('facebook'),
    description: z.string().optional(),
    deleteAfterEnd: z.boolean(),
    countdown: z.boolean(),
    post: postSchema,
});
