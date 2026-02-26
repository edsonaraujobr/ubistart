import { z } from 'zod';

export const forceUpdatePlatformSchema = z.object({
  latest: z.number().int(),
  required: z.number().int(),
});

export const forceUpdateSchema = z.object({
  android: forceUpdatePlatformSchema,
  ios: forceUpdatePlatformSchema,
});

export const settingsSchema = z.object({
  forceUpdate: forceUpdateSchema,
});
