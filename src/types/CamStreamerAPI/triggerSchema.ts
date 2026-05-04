import { z } from 'zod';
import { TRIGGER_TYPES } from './streamCommonTypes';

export const ioSchema = z.object({
    triggerType: z.literal(TRIGGER_TYPES.io),
});
export type TIoTrigger = z.infer<typeof ioSchema>;

export const manualSchema = z.object({
    triggerType: z.literal(TRIGGER_TYPES.manual),
});
export type TManualTrigger = z.infer<typeof manualSchema>;

export const nonstopSchema = z.object({
    triggerType: z.literal(TRIGGER_TYPES.nonstop),
});
export type TNonstopTrigger = z.infer<typeof nonstopSchema>;

export const onetimeSchema = z.object({
    triggerType: z.literal(TRIGGER_TYPES.onetime),
});
export type TOnetimeTrigger = z.infer<typeof onetimeSchema>;

export const recurrentSchema = z.object({
    triggerType: z.literal(TRIGGER_TYPES.recurrent),
});
export type TRecurrentTrigger = z.infer<typeof recurrentSchema>;

export const triggerSchema = z.discriminatedUnion('triggerType', [
    ioSchema,
    manualSchema,
    nonstopSchema,
    onetimeSchema,
    recurrentSchema,
]);
export type TTrigger = z.infer<typeof triggerSchema>;
