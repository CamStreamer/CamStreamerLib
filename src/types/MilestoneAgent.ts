import { z } from 'zod';

export type MilestoneAgentOptions = {
    protocol?: 'http' | 'https' | 'https_insecure';
    ip?: string;
    port?: number;
    user?: string;
    pass?: string;
    timeout?: number;
};

export const tokenResponseSchema = z.object({
    access_token: z.string(),
    expires_in: z.number(),
    token_type: z.string(),
});
export type TTokenResponse = z.infer<typeof tokenResponseSchema>;

export const milestoneCameraSchema = z.object({
    id: z.string(),
    name: z.string().optional(),
    displayName: z.string().optional(),
    enabled: z.boolean().optional(),
});
export type TMilestoneCamera = z.infer<typeof milestoneCameraSchema>;

export const camerasResponseSchema = z.object({
    array: z.array(milestoneCameraSchema),
});
export type TCamerasResponse = z.infer<typeof camerasResponseSchema>;

export type TBookmark = {
    header: string;
    description: string;
    timeBegin: string;
    timeEnd: string;
    timeTriggered: string;
    reference: string;
};
