import { z } from 'zod';

export const successResponseSchema = z.object({
    Rsp: z.object({
        Status: z.literal('Ok'),
    }),
});

export const cameraGuidsResponseSchema = z.object({
    Rsp: z.object({
        Status: z.literal('Ok'),
        Result: z.array(z.object({ Guid: z.string() })),
    }),
});
export type TCameraGuidsResponse = z.infer<typeof cameraGuidsResponseSchema>;

export const cameraDetailSchema = z.object({
    Guid: z.string().optional(),
    Name: z.string().optional(),
    EntityType: z.string().optional(),
});
export const cameraDetailsResponseSchema = z.object({
    Rsp: z.object({
        Status: z.literal('Ok'),
        Result: z.union([z.array(cameraDetailSchema), cameraDetailSchema]),
    }),
});
export type TCameraDetailsResponse = z.infer<typeof cameraDetailsResponseSchema>;
export type TCameraDetail = z.infer<typeof cameraDetailSchema>;

export const cameraListSchema = z.array(
    z.object({
        index: z.number(),
        value: z.string(),
        label: z.string(),
    })
);
export type TCameraList = z.infer<typeof cameraListSchema>;

export type TParams = Array<'Guid' | 'Name' | 'EntityType'>;
export type TProtocol = 'http' | 'https' | 'https_insecure';

export type GenetecAgentOptions = {
    protocol?: TProtocol;
    ip?: string;
    port?: number;
    baseUri?: string;
    user?: string;
    pass?: string;
    appId?: string;
    timeout?: number;
};
