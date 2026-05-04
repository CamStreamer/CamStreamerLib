import { z } from 'zod';
import { AUDIO_TYPES } from './streamCommonTypes';

export const externalSchema = z.object({
    audioType: z.literal(AUDIO_TYPES.external),
});
export type TExternalAudio = z.infer<typeof externalSchema>;

export const fileSchema = z.object({
    audioType: z.literal(AUDIO_TYPES.file),
});
export type TFileAudio = z.infer<typeof fileSchema>;

export const microphoneSchema = z.object({
    audioType: z.literal(AUDIO_TYPES.microphone),
});
export type TMicrophoneAudio = z.infer<typeof microphoneSchema>;

export const noneSchema = z.object({
    audioType: z.literal(AUDIO_TYPES.none),
});
export type TNoneAudio = z.infer<typeof noneSchema>;

export const audioSchema = z.discriminatedUnion('audioType', [
    externalSchema,
    fileSchema,
    microphoneSchema,
    noneSchema,
]);
export type TAudio = z.infer<typeof audioSchema>;
